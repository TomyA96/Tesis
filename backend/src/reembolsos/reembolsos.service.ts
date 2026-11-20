import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AprobarReembolsosDto, BuscarTicketsDto, RechazarReembolsoDto, RegistrarReembolsoDto } from './dtos/reembolsos.dto';
import { JORNADAS_CON_DEVOLUCION, MOTIVO_NO_DEVOLVIBLE } from './utils/devoluciones';

// Lo que se muestra de cada ticket: su lote y jornada, por dónde se vendió y quién lo compró (si fue online)
const DATOS_TICKET = {
    id: true,
    numero: true,
    precio: true,
    estado: true,
    idVentaPuerta: true,
    entrada: {
        select: { id: true, descripcion: true, esBoleteria: true, jornada: { select: { id: true, nombre: true, fechaHoraInicio: true, estado: true } } },
    },
    puntoVenta: { select: { nombre: true } },
    orden: { select: { id: true, cliente: { select: { nombre: true, dni: true, email: true, telefono: true } } } },
} satisfies Prisma.TicketEventoSelect;

type TicketConDatos = Prisma.TicketEventoGetPayload<{ select: typeof DATOS_TICKET & { reembolso: { select: { estado: true } } } }>;

/*
    Devoluciones de tickets. Solo de jornadas suspendidas o canceladas, solo
    tickets vendidos que no entraron, y por el precio del ticket.

    Las solicitudes nacen de dos formas: solas, al cancelar una jornada (las
    ventas online, ver generarDevolucionesPorCancelacion), o cargadas por el
    encargado cuando la persona presenta su ticket. El encargado las aprueba
    (el ticket pasa a Reembolsado: no sirve para entrar y deja de contar en
    la recaudación) o las rechaza. La plata se devuelve por fuera del sistema;
    acá queda cómo.
*/
@Injectable()
export class ReembolsosService {
    constructor(private prisma: PrismaService) {}

    /*
        La pantalla de un evento: sus jornadas suspendidas o canceladas (con
        cuánto queda por devolver en cada una) y todas sus solicitudes, las
        pendientes primero.
    */
    async deEvento(idEvento: number) {
        const evento = await this.prisma.evento.findUnique({ where: { id: idEvento }, select: { id: true, nombre: true } });
        if (!evento) throw new NotFoundException('No existe el evento');

        const [jornadas, solicitudes, sinSolicitud] = await Promise.all([
            this.prisma.jornada.findMany({
                where: { idEvento, estado: { in: JORNADAS_CON_DEVOLUCION } },
                orderBy: { fechaHoraInicio: 'asc' },
                select: {
                    id: true,
                    nombre: true,
                    fechaHoraInicio: true,
                    estado: true,
                    // Para buscar un ticket de papel por lote y número
                    entradas: { select: { id: true, descripcion: true, esFisica: true }, orderBy: { id: 'asc' } },
                },
            }),
            this.prisma.reembolso.findMany({
                where: { ticket: { entrada: { jornada: { idEvento } } } },
                include: {
                    ticket: { select: DATOS_TICKET },
                    usuario: { select: { nombre: true } },
                    usuarioRegistro: { select: { nombre: true } },
                },
                orderBy: { id: 'desc' },
            }),
            // Vendidos sin entrar y sin solicitud: lo que todavía podría pedir devolución
            this.prisma.ticketEvento.groupBy({
                by: ['idEntrada'],
                where: { entrada: { jornada: { idEvento, estado: { in: JORNADAS_CON_DEVOLUCION } } }, estado: 'Vendido', reembolso: null },
                _count: true,
            }),
        ]);

        const resumen = jornadas.map((j) => {
            const deLaJornada = solicitudes.filter((s) => s.ticket.entrada.jornada.id === j.id);
            const idsLotes = new Set(j.entradas.map((e) => e.id));
            const contar = (estado: string) => deLaJornada.filter((s) => s.estado === estado).length;
            return {
                ...j,
                sinSolicitud: sinSolicitud.filter((g) => idsLotes.has(g.idEntrada)).reduce((suma, g) => suma + g._count, 0),
                pendientes: contar('Pendiente'),
                aprobadas: contar('Procesado'),
                rechazadas: contar('Rechazado'),
                montoPendiente: deLaJornada.filter((s) => s.estado === 'Pendiente').reduce((suma, s) => suma.plus(s.monto), new Prisma.Decimal(0)),
            };
        });

        // Las pendientes arriba: es lo que hay que resolver
        solicitudes.sort((a, b) => Number(b.estado === 'Pendiente') - Number(a.estado === 'Pendiente') || b.id - a.id);
        return { evento, jornadas: resumen, solicitudes };
    }

    /*
        Busca los tickets de quien pide la devolución y dice de cada uno si
        se puede devolver o por qué no. Se usa una sola forma de búsqueda por
        vez.
    */
    async buscar(dto: BuscarTicketsDto) {
        const formas = [dto.codigoQR, dto.idEntrada !== undefined || dto.numero !== undefined ? 'lote' : undefined, dto.idOrden, dto.dni].filter(
            (f) => f !== undefined,
        );
        if (formas.length !== 1) {
            throw new BadRequestException('Buscá de una sola forma: por código QR, por lote y número, por N° de orden o por DNI');
        }
        if ((dto.idEntrada === undefined) !== (dto.numero === undefined)) {
            throw new BadRequestException('Para buscar por número hace falta el lote y el número');
        }

        const delEvento: Prisma.TicketEventoWhereInput = { entrada: { jornada: { idEvento: dto.idEvento } } };
        const filtro: Prisma.TicketEventoWhereInput = dto.codigoQR
            ? { codigoQR: dto.codigoQR }
            : dto.idEntrada !== undefined
              ? { idEntrada: dto.idEntrada, numero: dto.numero }
              : dto.idOrden !== undefined
                ? { idOrden: dto.idOrden }
                : { orden: { cliente: { dni: dto.dni } } };

        const tickets = await this.prisma.ticketEvento.findMany({
            where: { AND: [delEvento, filtro] },
            select: { ...DATOS_TICKET, reembolso: { select: { estado: true } } },
            orderBy: [{ idEntrada: 'asc' }, { id: 'asc' }],
            take: 50,
        });
        return tickets.map((t) => ({ ...t, ...this.evaluar(t) }));
    }

    // Si un ticket se puede devolver ahora, o el motivo por el que no
    private evaluar(t: TicketConDatos): { devolvible: boolean; motivoNoDevolvible: string | null } {
        let motivo: string | null = null;
        if (t.reembolso) {
            motivo = `Ya tiene una solicitud (${t.reembolso.estado === 'Procesado' ? 'aprobada' : t.reembolso.estado.toLowerCase()})`;
        } else if (!JORNADAS_CON_DEVOLUCION.includes(t.entrada.jornada.estado)) {
            motivo = 'Solo se devuelven tickets de jornadas suspendidas o canceladas';
        } else if (t.estado !== 'Vendido') {
            motivo = MOTIVO_NO_DEVOLVIBLE[t.estado] ?? 'No se puede devolver';
        } else if (t.precio.isZero()) {
            motivo = 'Es una entrada gratuita: no hay nada que devolver';
        }
        return { devolvible: motivo === null, motivoNoDevolvible: motivo };
    }

    // Carga la solicitud de los tickets elegidos: todos tienen que poder devolverse, si no no se carga ninguno
    async registrar(dto: RegistrarReembolsoDto, idUsuario: number) {
        return this.prisma.$transaction(async (tx) => {
            const tickets = await tx.ticketEvento.findMany({
                where: { id: { in: dto.idsTickets }, entrada: { jornada: { idEvento: dto.idEvento } } },
                select: { ...DATOS_TICKET, reembolso: { select: { estado: true } } },
            });
            if (tickets.length !== dto.idsTickets.length) {
                throw new NotFoundException('Algún ticket no existe o no es de este evento');
            }
            const problemas = tickets
                .map((t) => ({ t, ...this.evaluar(t) }))
                .filter((r) => !r.devolvible)
                .map((r) => `${r.t.entrada.descripcion} #${r.t.numero}: ${r.motivoNoDevolvible}`);
            if (problemas.length > 0) {
                throw new ConflictException(`No se cargó ninguna solicitud. ${problemas.join('. ')}`);
            }

            const { count } = await tx.reembolso.createMany({
                data: tickets.map((t) => ({
                    idTicket: t.id,
                    origen: 'Presencial' as const,
                    idUsuarioRegistro: idUsuario,
                    motivo: dto.motivo,
                    monto: t.precio,
                    estado: 'Pendiente' as const,
                })),
                skipDuplicates: true,
            });
            // Otro encargado pudo cargar alguna mientras tanto: se deshace todo
            if (count !== tickets.length) {
                throw new ConflictException('Algún ticket ya tenía una solicitud. Recargá la pantalla y probá de nuevo');
            }
            return { registradas: count };
        });
    }

    /*
        Aprueba las solicitudes elegidas con el medio por el que se devuelve
        la plata. Sus tickets pasan a Reembolsado. Si alguno se usó para
        entrar mientras la solicitud esperaba (la jornada se reprogramó y la
        persona fue), esa solicitud se rechaza sola: no corresponde devolver.
    */
    async aprobar(dto: AprobarReembolsosDto, idUsuario: number) {
        return this.prisma.$transaction(async (tx) => {
            const solicitudes = await tx.reembolso.findMany({
                where: { id: { in: dto.ids }, ticket: { entrada: { jornada: { idEvento: dto.idEvento } } } },
                include: { ticket: { select: { id: true, estado: true } } },
            });
            if (solicitudes.length !== dto.ids.length) {
                throw new NotFoundException('Alguna solicitud no existe o no es de este evento');
            }
            if (solicitudes.some((s) => s.estado !== 'Pendiente')) {
                throw new ConflictException('Alguna de las solicitudes ya se resolvió. Recargá la pantalla y probá de nuevo');
            }

            const ahora = new Date();
            const vendidas = solicitudes.filter((s) => s.ticket.estado === 'Vendido');
            const yaUsadas = solicitudes.filter((s) => s.ticket.estado !== 'Vendido');

            // La condición sobre el estado es el candado: si el ticket cambió entre la lectura y acá, no cierra la cuenta
            const { count } = await tx.ticketEvento.updateMany({
                where: { id: { in: vendidas.map((s) => s.ticket.id) }, estado: 'Vendido' },
                data: { estado: 'Reembolsado' },
            });
            if (count !== vendidas.length) {
                throw new ConflictException('Algún ticket cambió mientras tanto. Recargá la pantalla y probá de nuevo');
            }
            await tx.reembolso.updateMany({
                where: { id: { in: vendidas.map((s) => s.id) }, estado: 'Pendiente' },
                data: { estado: 'Procesado', idUsuario, fechaResolucion: ahora, medioDevolucion: dto.medioDevolucion },
            });
            if (yaUsadas.length > 0) {
                await tx.reembolso.updateMany({
                    where: { id: { in: yaUsadas.map((s) => s.id) }, estado: 'Pendiente' },
                    data: {
                        estado: 'Rechazado',
                        idUsuario,
                        fechaResolucion: ahora,
                        comentario: 'El ticket ya no estaba vendido sin usar (por ejemplo, se usó para entrar): no corresponde la devolución',
                    },
                });
            }
            return { aprobadas: vendidas.length, rechazadas: yaUsadas.length };
        });
    }

    async rechazar(id: number, dto: RechazarReembolsoDto, idUsuario: number) {
        const { count } = await this.prisma.reembolso.updateMany({
            where: { id, estado: 'Pendiente' },
            data: { estado: 'Rechazado', idUsuario, fechaResolucion: new Date(), comentario: dto.comentario },
        });
        if (count === 0) {
            const existe = await this.prisma.reembolso.count({ where: { id } });
            throw existe ? new ConflictException('La solicitud ya se resolvió') : new NotFoundException('No existe la solicitud');
        }
        return this.prisma.reembolso.findUnique({ where: { id } });
    }
}
