import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRendicionDto } from './dtos/create.rendicion.dto';
import { ticketsSinRendir } from '../entradas/utils/tickets';

type Db = PrismaService | Prisma.TransactionClient;
const { Decimal } = Prisma;
const CERO = new Decimal(0);

/*
    Pendientes de rendir (ver ticketsSinRendir): los Asignado al local que
    todavía no entraron en ninguna rendición, y los Usado con local, que
    pasaron por el control de acceso antes de que el local rindiera, así
    que seguro se vendieron. Finalizar el evento usa la misma condición.
*/
const pendientesDe = (idEvento: number, idPuntoVenta: number) => ticketsSinRendir(idEvento, idPuntoVenta);

// "$ 1.500,00": el mismo formato que muestra el frontend
const formatoPesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const pesos = (monto: Prisma.Decimal) => formatoPesos.format(monto.toNumber());

@Injectable()
export class RendicionesService {
    constructor(private prisma: PrismaService) {}

    // Lo que el local quedó debiendo en su última rendición de este evento
    private async saldoActual(db: Db, idEvento: number, idPuntoVenta: number) {
        const ultima = await db.rendicion.findFirst({
            where: { idEvento, idPuntoVenta },
            orderBy: { id: 'desc' },
            select: { saldoPendiente: true },
        });
        return ultima?.saldoPendiente ?? CERO;
    }

    /*
        Los locales que tuvieron tickets de este evento, con cuántos tienen
        pendientes de rendir y cuánto deben. Es la lista para elegir a quién
        se le rinde.
    */
    async localesDeEvento(idEvento: number) {
        const delEvento = { entrada: { jornada: { idEvento } }, idPuntoVenta: { not: null } };
        const [conTickets, pendientes, rendiciones] = await Promise.all([
            this.prisma.ticketEvento.groupBy({ by: ['idPuntoVenta'], where: delEvento, _count: true }),
            this.prisma.ticketEvento.groupBy({ by: ['idPuntoVenta'], where: ticketsSinRendir(idEvento), _count: true }),
            // Ordenadas de la más nueva a la más vieja: la primera de cada local tiene su saldo actual
            this.prisma.rendicion.findMany({
                where: { idEvento },
                orderBy: { id: 'desc' },
                select: { idPuntoVenta: true, saldoPendiente: true },
            }),
        ]);

        const ids = conTickets.map((g) => g.idPuntoVenta as number);
        const puntos = await this.prisma.puntoVenta.findMany({ where: { id: { in: ids } }, orderBy: { nombre: 'asc' } });

        return puntos.map((punto) => ({
            puntoVenta: punto,
            pendientes: pendientes.find((g) => g.idPuntoVenta === punto.id)?._count ?? 0,
            saldo: rendiciones.find((r) => r.idPuntoVenta === punto.id)?.saldoPendiente ?? CERO,
        }));
    }

    // Lo que hay que resolver en la rendición: los tickets pendientes del local y lo que ya debía
    async pendiente(idEvento: number, idPuntoVenta: number) {
        const [tickets, saldoAnterior] = await Promise.all([
            this.prisma.ticketEvento.findMany({
                where: pendientesDe(idEvento, idPuntoVenta),
                select: {
                    id: true,
                    numero: true,
                    precio: true,
                    estado: true,
                    entrada: {
                        select: {
                            id: true,
                            descripcion: true,
                            // El estado avisa en la pantalla cuando la jornada se canceló
                            jornada: { select: { id: true, nombre: true, fechaHoraInicio: true, estado: true } },
                        },
                    },
                },
            }),
            this.saldoActual(this.prisma, idEvento, idPuntoVenta),
        ]);

        // Por jornada, lote y número (el número es texto: se compara como número)
        tickets.sort(
            (a, b) =>
                a.entrada.jornada.fechaHoraInicio.getTime() - b.entrada.jornada.fechaHoraInicio.getTime() ||
                a.entrada.id - b.entrada.id ||
                Number(a.numero) - Number(b.numero),
        );
        return { tickets, saldoAnterior };
    }

    findDeEvento(idEvento: number) {
        return this.prisma.rendicion.findMany({
            where: { idEvento },
            orderBy: { id: 'desc' },
            include: {
                puntoVenta: { select: { id: true, nombre: true } },
                usuario: { select: { nombre: true } },
            },
        });
    }

    private calcularComision(dto: CreateRendicionDto, montoVendido: Prisma.Decimal) {
        if (dto.tipoComision === 'Ninguna') {
            return { valorComision: null, montoComision: CERO };
        }
        if (dto.valorComision === undefined) {
            throw new BadRequestException('Ingresá el valor de la comisión');
        }
        const valor = new Decimal(dto.valorComision);

        if (dto.tipoComision === 'Porcentaje') {
            if (valor.gt(100)) {
                throw new BadRequestException('El porcentaje de comisión no puede superar el 100%');
            }
            return { valorComision: valor, montoComision: montoVendido.mul(valor).div(100).toDecimalPlaces(2) };
        }

        // Monto fijo: no puede llevarse más de lo que vendió
        if (valor.gt(montoVendido)) {
            throw new BadRequestException(`La comisión (${pesos(valor)}) no puede superar lo vendido (${pesos(montoVendido)})`);
        }
        return { valorComision: valor, montoComision: valor };
    }

    async registrar(idUsuario: number, dto: CreateRendicionDto) {
        const { idEvento, idPuntoVenta } = dto;

        const [evento, puntoVenta] = await Promise.all([
            this.prisma.evento.findUnique({ where: { id: idEvento } }),
            this.prisma.puntoVenta.findUnique({ where: { id: idPuntoVenta } }),
        ]);
        if (!evento) throw new NotFoundException('No existe el evento');
        if (!puntoVenta) throw new NotFoundException('No existe el punto de venta');

        const idsVendidos = new Set(dto.idsVendidos);
        const idsDevueltos = new Set(dto.idsDevueltos);
        if ([...idsVendidos].some((id) => idsDevueltos.has(id))) {
            throw new BadRequestException('Un ticket no puede estar vendido y devuelto a la vez');
        }

        return this.prisma.$transaction(async (tx) => {
            const pendientes = await tx.ticketEvento.findMany({
                where: pendientesDe(idEvento, idPuntoVenta),
                select: { id: true, estado: true, precio: true },
            });
            const porId = new Map(pendientes.map((t) => [t.id, t]));

            if ([...idsVendidos, ...idsDevueltos].some((id) => !porId.has(id))) {
                throw new ConflictException(
                    `Algunos tickets ya no están pendientes de rendir en ${puntoVenta.nombre}. Recargá la pantalla y probá de nuevo`,
                );
            }
            // Uno que ya pasó por el control de acceso se vendió sí o sí
            const usados = pendientes.filter((t) => t.estado === 'Usado');
            if (usados.some((t) => idsDevueltos.has(t.id))) {
                throw new ConflictException('Un ticket que ya se usó para entrar no se puede devolver: cuenta como vendido');
            }
            usados.forEach((t) => idsVendidos.add(t.id));

            const montoVendido = [...idsVendidos].reduce((suma, id) => suma.add(porId.get(id)!.precio), CERO);
            const { valorComision, montoComision } = this.calcularComision(dto, montoVendido);
            const saldoAnterior = await this.saldoActual(tx, idEvento, idPuntoVenta);
            const montoRecibido = new Decimal(dto.montoRecibido).toDecimalPlaces(2);
            const aCobrar = saldoAnterior.add(montoVendido).sub(montoComision);

            if (idsVendidos.size === 0 && idsDevueltos.size === 0 && montoRecibido.isZero()) {
                throw new BadRequestException('No hay nada para rendir: marcá tickets vendidos o devueltos, o cargá un pago');
            }
            if (montoRecibido.gt(aCobrar)) {
                throw new BadRequestException(
                    `El monto recibido (${pesos(montoRecibido)}) supera lo que corresponde cobrar (${pesos(aCobrar)})`,
                );
            }

            const rendicion = await tx.rendicion.create({
                data: {
                    idPuntoVenta,
                    idEvento,
                    idUsuario,
                    cantidadVendidos: idsVendidos.size,
                    cantidadDevueltos: idsDevueltos.size,
                    montoVendido,
                    tipoComision: dto.tipoComision,
                    valorComision,
                    montoComision,
                    saldoAnterior,
                    montoRecibido,
                    saldoPendiente: aCobrar.sub(montoRecibido),
                    observacion: dto.observacion?.trim() || null,
                },
            });

            /*
                Cada updateMany repite "pendiente" en el where: si otro usuario
                tocó alguno de estos tickets entre la lectura y acá, el count
                no cierra y se deshace toda la rendición.
            */
            const vendidosAsignados = [...idsVendidos].filter((id) => porId.get(id)!.estado === 'Asignado');
            const actualizados = [
                await tx.ticketEvento.updateMany({
                    where: { id: { in: vendidosAsignados }, estado: 'Asignado', idRendicion: null },
                    data: { estado: 'Vendido', idRendicion: rendicion.id },
                }),
                await tx.ticketEvento.updateMany({
                    where: { id: { in: usados.map((t) => t.id) }, estado: 'Usado', idRendicion: null },
                    data: { idRendicion: rendicion.id },
                }),
                await tx.ticketEvento.updateMany({
                    where: { id: { in: [...idsDevueltos] }, estado: 'Asignado', idRendicion: null },
                    data: { estado: 'Anulado', idRendicion: rendicion.id },
                }),
            ].reduce((suma, r) => suma + r.count, 0);

            if (actualizados !== idsVendidos.size + idsDevueltos.size) {
                throw new ConflictException('Algunos tickets cambiaron mientras tanto. Recargá la pantalla y probá de nuevo');
            }
            return rendicion;
        });
    }
}
