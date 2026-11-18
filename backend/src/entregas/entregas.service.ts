import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntregaDto, ItemEntregaDto } from './dtos/create.entrega.dto';
import { comprobanteEntregaPDF, type DatosComprobante } from './utils/comprobante';
import { agruparEnTramos, type Tramo } from './utils/tramos';

type Db = PrismaService | Prisma.TransactionClient;

// Qué sale de cada lote en una entrega
export type DetalleLote = {
    idEntrada: number;
    descripcion: string;
    jornada: { id: number; nombre: string | null; fechaHoraInicio: Date };
    precio: Prisma.Decimal;
    cantidad: number;
    tramos: Tramo[];
    idsTickets: number[];
};

/*
    Entregar tickets físicos a un punto de venta por cantidad: de cada lote
    se toman los N que están en mano (Impreso) con número más bajo. Cada
    entrega queda registrada con sus tickets, para el comprobante y para
    saber qué se le dio a cada local.
*/
@Injectable()
export class EntregasService {
    constructor(private prisma: PrismaService) {}

    // Lo que saldría de cada lote. Es lo que se muestra antes de confirmar y lo que se guarda al entregar.
    private async armarPlan(db: Db, idEvento: number, items: ItemEntregaDto[]): Promise<DetalleLote[]> {
        const ids = items.map((i) => i.idEntrada);
        if (new Set(ids).size !== ids.length) {
            throw new BadRequestException('Hay un lote repetido en la entrega');
        }

        const lotes = await db.entrada.findMany({
            where: { id: { in: ids } },
            include: {
                jornada: { select: { id: true, idEvento: true, nombre: true, fechaHoraInicio: true, estado: true } },
                tickets: { where: { estado: 'Impreso' }, select: { id: true, numero: true } },
            },
        });

        // En el orden en que se leen: por fecha de jornada y nombre de lote, no en el que se cargaron
        const ordenados = [...items].sort((a, b) => {
            const la = lotes.find((l) => l.id === a.idEntrada);
            const lb = lotes.find((l) => l.id === b.idEntrada);
            if (!la || !lb) return 0;
            return la.jornada.fechaHoraInicio.getTime() - lb.jornada.fechaHoraInicio.getTime() || la.descripcion.localeCompare(lb.descripcion);
        });

        return ordenados.map((item) => {
            const lote = lotes.find((l) => l.id === item.idEntrada);
            if (!lote || lote.jornada.idEvento !== idEvento) {
                throw new NotFoundException('Alguno de los lotes no pertenece a este evento');
            }
            const nombre = `${lote.descripcion} (${lote.jornada.nombre ?? 'jornada'})`;
            // La boletería no tiene tickets en mano: los suyos se crean y se venden en la puerta
            if (lote.esBoleteria) {
                throw new ConflictException('La boletería no se entrega a locales: sus tickets se venden en la puerta');
            }
            if (!lote.esFisica) {
                throw new ConflictException(`${nombre} es un lote online: solo se entregan tickets físicos`);
            }
            if (lote.estado !== 'Disponible') {
                throw new ConflictException(`${nombre} todavía no se imprimió o ya está anulado`);
            }
            if (lote.jornada.estado === 'Finalizado' || lote.jornada.estado === 'Cancelado') {
                throw new ConflictException(`La jornada de ${nombre} ya terminó: no se entregan más tickets`);
            }
            if (lote.tickets.length < item.cantidad) {
                throw new ConflictException(
                    `${nombre}: pediste ${item.cantidad} y hay ${lote.tickets.length} en mano`,
                );
            }

            // numero es texto: se ordena como número para que el 10 no quede antes que el 2
            const elegidos = [...lote.tickets].sort((a, b) => Number(a.numero) - Number(b.numero)).slice(0, item.cantidad);
            return {
                idEntrada: lote.id,
                descripcion: lote.descripcion,
                jornada: { id: lote.jornada.id, nombre: lote.jornada.nombre, fechaHoraInicio: lote.jornada.fechaHoraInicio },
                precio: lote.precio,
                cantidad: elegidos.length,
                tramos: agruparEnTramos(elegidos.map((t) => Number(t.numero))),
                idsTickets: elegidos.map((t) => t.id),
            };
        });
    }

    private async obtenerPuntoVenta(idPuntoVenta: number) {
        const puntoVenta = await this.prisma.puntoVenta.findUnique({ where: { id: idPuntoVenta } });
        if (!puntoVenta) throw new NotFoundException('No existe el punto de venta');
        if (puntoVenta.estado !== 'Activo') {
            throw new ConflictException(`${puntoVenta.nombre} está inactivo: no se le pueden entregar tickets`);
        }
        return puntoVenta;
    }

    // Vista previa: qué números saldrían. No guarda nada.
    async previa(dto: CreateEntregaDto) {
        await this.obtenerPuntoVenta(dto.idPuntoVenta);
        const plan = await this.armarPlan(this.prisma, dto.idEvento, dto.items);
        return plan.map(({ idsTickets: _ids, ...detalle }) => detalle);
    }

    async registrar(idUsuario: number, dto: CreateEntregaDto) {
        const puntoVenta = await this.obtenerPuntoVenta(dto.idPuntoVenta);

        return this.prisma.$transaction(async (tx) => {
            const plan = await this.armarPlan(tx, dto.idEvento, dto.items);
            const idsTickets = plan.flatMap((d) => d.idsTickets);

            const entrega = await tx.entrega.create({
                data: {
                    idPuntoVenta: puntoVenta.id,
                    idEvento: dto.idEvento,
                    idUsuario,
                    cantidadOriginal: idsTickets.length,
                    observacion: dto.observacion?.trim() || null,
                },
            });

            /*
                El where repite "Impreso": si otro usuario asignó alguno de
                estos tickets entre el plan y acá, el count no cierra y se
                deshace todo, incluida la entrega recién creada.
            */
            const { count } = await tx.ticketEvento.updateMany({
                where: { id: { in: idsTickets }, estado: 'Impreso' },
                data: { estado: 'Asignado', idPuntoVenta: puntoVenta.id, idEntrega: entrega.id },
            });
            if (count !== idsTickets.length) {
                throw new ConflictException('Algunos tickets se asignaron mientras tanto. Recargá la pantalla y probá de nuevo');
            }

            return {
                ...entrega,
                puntoVenta: { id: puntoVenta.id, nombre: puntoVenta.nombre },
                detalle: plan.map(({ idsTickets: _ids, ...d }) => d),
            };
        });
    }

    /*
        Entregar tickets elegidos uno por uno (desde la lista de un lote): los
        que estaban en mano o en otro local pasan a una entrega nueva para
        este local. La entrega de donde salieron queda corregida sola: sus
        tickets actuales son los que siguen apuntando a ella. Es otro papel
        que el local tiene que firmar, por eso no se suman a una entrega vieja.
        Recibe la transacción de quien llama (TicketEventoService.asignar).
    */
    static async entregarSeleccionados(
        tx: Prisma.TransactionClient,
        datos: { idsTickets: number[]; idPuntoVenta: number; idEvento: number; idUsuario: number },
    ) {
        const entrega = await tx.entrega.create({
            data: {
                idPuntoVenta: datos.idPuntoVenta,
                idEvento: datos.idEvento,
                idUsuario: datos.idUsuario,
                cantidadOriginal: datos.idsTickets.length,
            },
        });
        const { count } = await tx.ticketEvento.updateMany({
            where: { id: { in: datos.idsTickets }, estado: { in: ['Impreso', 'Asignado'] } },
            data: { estado: 'Asignado', idPuntoVenta: datos.idPuntoVenta, idEntrega: entrega.id },
        });
        return { entrega, count };
    }

    // Historial de entregas del evento, de la más nueva a la más vieja
    findDeEvento(idEvento: number) {
        return this.prisma.entrega.findMany({
            where: { idEvento },
            orderBy: { id: 'desc' },
            include: {
                puntoVenta: { select: { id: true, nombre: true } },
                usuario: { select: { nombre: true } },
                _count: { select: { tickets: true } },
            },
        });
    }

    async comprobante(id: number): Promise<Buffer> {
        const entrega = await this.prisma.entrega.findUnique({
            where: { id },
            include: {
                evento: { select: { nombre: true } },
                puntoVenta: { select: { nombre: true, telefono: true } },
                usuario: { select: { nombre: true } },
                tickets: {
                    select: {
                        numero: true,
                        precio: true,
                        entrada: {
                            select: {
                                id: true,
                                descripcion: true,
                                jornada: { select: { nombre: true, fechaHoraInicio: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!entrega) throw new NotFoundException('No existe la entrega');

        // Los tickets vienen sueltos: se vuelven a agrupar por lote, con sus tramos
        const porLote = new Map<number, DatosComprobante['lotes'][number]>();
        for (const t of entrega.tickets) {
            const lote = porLote.get(t.entrada.id) ?? {
                descripcion: t.entrada.descripcion,
                jornada: t.entrada.jornada,
                precio: t.precio,
                numeros: [],
            };
            lote.numeros.push(Number(t.numero));
            porLote.set(t.entrada.id, lote);
        }
        const lotes = [...porLote.values()].sort(
            (a, b) => a.jornada.fechaHoraInicio.getTime() - b.jornada.fechaHoraInicio.getTime() || a.descripcion.localeCompare(b.descripcion),
        );

        return comprobanteEntregaPDF({
            id: entrega.id,
            fechaHora: entrega.fechaHora,
            evento: entrega.evento.nombre,
            puntoVenta: entrega.puntoVenta,
            usuario: entrega.usuario.nombre,
            observacion: entrega.observacion,
            cantidadOriginal: entrega.cantidadOriginal,
            lotes,
        });
    }
}
