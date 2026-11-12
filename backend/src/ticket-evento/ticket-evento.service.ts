import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoTicket, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { liberarReservasVencidas } from '../entradas/utils/tickets';
import { EntregasService } from '../entregas/entregas.service';

type Tx = Prisma.TransactionClient;

// Elige singular o plural según la cantidad: "1 está asignado" / "3 están asignados"
const segun = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

// Por qué un ticket en cada estado no se puede anular (los anulables son Disponible e Impreso)
const MOTIVO_NO_ANULABLE: Partial<Record<EstadoTicket, (n: number) => string>> = {
    Reservado: (n) => `${segun(n, 'está en una compra', 'están en compras')} esperando el pago; probá de nuevo en unos minutos`,
    Asignado: (n) => `${segun(n, 'está asignado', 'están asignados')} a un punto de venta: primero quitale${n === 1 ? '' : 's'} la asignación`,
    Vendido: (n) => `${segun(n, 'ya se vendió', 'ya se vendieron')}: eso se resuelve con un reembolso`,
    Usado: (n) => `${segun(n, 'ya se usó', 'ya se usaron')} para entrar`,
    Anulado: (n) => segun(n, 'ya estaba anulado', 'ya estaban anulados'),
    Reembolsado: (n) => segun(n, 'ya fue reembolsado', 'ya fueron reembolsados'),
};

@Injectable()
export class TicketEventoService {
    constructor(private prisma: PrismaService) {}

    /*
        Todos los tickets de la jornada, con su lote y su punto de venta. El
        numero se guarda como texto ("1", "2"... "10"): se ordena acá como
        número, si no el 10 quedaría antes que el 2.
    */
    async findDeJornada(idJornada: number) {
        const tickets = await this.prisma.ticketEvento.findMany({
            where: { entrada: { idJornada } },
            select: {
                id: true,
                numero: true,
                precio: true,
                estado: true,
                entrada: { select: { id: true, descripcion: true, esFisica: true } },
                puntoVenta: { select: { id: true, nombre: true } },
            },
        });

        return tickets.sort((a, b) => a.entrada.id - b.entrada.id || Number(a.numero) - Number(b.numero));
    }

    /*
        Trae los tickets pedidos con lo que hace falta para validarlos. Si
        alguno no existe, o su jornada ya terminó, no se toca ninguno.
    */
    private async obtenerTickets(tx: Tx, ids: number[]) {
        const unicos = [...new Set(ids)];
        const tickets = await tx.ticketEvento.findMany({
            where: { id: { in: unicos } },
            select: {
                id: true,
                estado: true,
                idEntrada: true,
                idPuntoVenta: true,
                entrada: { select: { esFisica: true, jornada: { select: { estado: true, idEvento: true } } } },
            },
        });

        if (tickets.length !== unicos.length) {
            throw new NotFoundException('Algunos de los tickets elegidos no existen');
        }
        if (tickets.some((t) => t.entrada.jornada.estado === 'Finalizado' || t.entrada.jornada.estado === 'Cancelado')) {
            throw new ConflictException('La jornada ya terminó: sus tickets no se pueden modificar');
        }
        return tickets;
    }

    /*
        El updateMany repite la condición de estado: si entre la validación y
        la escritura otro usuario (o una compra) cambió alguno, el count no
        cierra y se deshace todo.
    */
    private verificarCantidad(actualizados: number, pedidos: number) {
        if (actualizados !== pedidos) {
            throw new ConflictException('Algunos tickets cambiaron de estado mientras tanto. Recargá la lista y probá de nuevo');
        }
    }

    // Asignar o reasignar: un ticket físico en mano (Impreso) o ya asignado pasa al local elegido
    /*
        Asignar o reasignar desde la lista de un lote: siempre se registra una
        entrega nueva para el local (con su comprobante). Los que ya estaban en
        otro local salen de esa entrega, que queda corregida sola.
    */
    async asignar(ids: number[], idPuntoVenta: number, idUsuario: number) {
        const puntoVenta = await this.prisma.puntoVenta.findUnique({ where: { id: idPuntoVenta } });
        if (!puntoVenta) {
            throw new NotFoundException('No existe el punto de venta');
        }
        if (puntoVenta.estado !== 'Activo') {
            throw new ConflictException(`${puntoVenta.nombre} está inactivo: no se le pueden asignar tickets`);
        }

        return this.prisma.$transaction(async (tx) => {
            const tickets = await this.obtenerTickets(tx, ids);

            if (tickets.some((t) => !t.entrada.esFisica)) {
                throw new ConflictException('Solo los tickets físicos se asignan a un punto de venta');
            }
            const noAsignables = tickets.filter((t) => t.estado !== 'Impreso' && t.estado !== 'Asignado');
            if (noAsignables.length > 0) {
                throw new ConflictException(
                    `${segun(noAsignables.length, 'de los tickets elegidos ya no se puede asignar', 'de los tickets elegidos ya no se pueden asignar')} (vendidos, usados o anulados)`,
                );
            }

            // Los que ya están en este mismo local no cambian de entrega: no se le entregan de nuevo
            const aMover = tickets.filter((t) => !(t.estado === 'Asignado' && t.idPuntoVenta === idPuntoVenta));
            if (aMover.length === 0) {
                throw new ConflictException(`Los tickets elegidos ya están en ${puntoVenta.nombre}`);
            }
            const eventos = new Set(aMover.map((t) => t.entrada.jornada.idEvento));
            if (eventos.size > 1) {
                throw new BadRequestException('Los tickets elegidos son de eventos distintos');
            }

            const { entrega, count } = await EntregasService.entregarSeleccionados(tx, {
                idsTickets: aMover.map((t) => t.id),
                idPuntoVenta,
                idEvento: [...eventos][0],
                idUsuario,
            });
            this.verificarCantidad(count, aMover.length);
            return {
                actualizados: count,
                yaEstaban: tickets.length - aMover.length,
                entrega: { id: entrega.id, puntoVenta: { id: puntoVenta.id, nombre: puntoVenta.nombre } },
            };
        });
    }

    /*
        Corregir un error: el ticket asignado vuelve a estar en mano del
        organizador y sale de su entrega, que queda corregida (el comprobante
        y el historial muestran los que siguen y la cantidad original).
    */
    async quitarAsignacion(ids: number[]) {
        return this.prisma.$transaction(async (tx) => {
            const tickets = await this.obtenerTickets(tx, ids);

            const sinAsignar = tickets.filter((t) => t.estado !== 'Asignado');
            if (sinAsignar.length > 0) {
                throw new ConflictException(
                    `${segun(sinAsignar.length, 'de los tickets elegidos no está asignado', 'de los tickets elegidos no están asignados')} a ningún punto de venta`,
                );
            }

            const { count } = await tx.ticketEvento.updateMany({
                where: { id: { in: tickets.map((t) => t.id) }, estado: 'Asignado' },
                data: { estado: 'Impreso', idPuntoVenta: null, idEntrega: null },
            });
            this.verificarCantidad(count, tickets.length);
            return { actualizados: count };
        });
    }

    /*
        Se anulan los que nadie tiene: online a la venta (Disponible) y
        físicos en mano (Impreso). Si en la selección hay alguno en otro
        estado no se anula ninguno, y el mensaje dice por qué.
    */
    async anular(ids: number[]) {
        return this.prisma.$transaction(async (tx) => {
            // Una reserva vencida ya no retiene el ticket: vuelve a Disponible antes de mirar
            const previos = await tx.ticketEvento.findMany({ where: { id: { in: ids } }, select: { idEntrada: true } });
            await liberarReservasVencidas(tx, [...new Set(previos.map((t) => t.idEntrada))]);

            const tickets = await this.obtenerTickets(tx, ids);

            const cantidadPorEstado = new Map<EstadoTicket, number>();
            for (const t of tickets) {
                if (t.estado !== 'Disponible' && t.estado !== 'Impreso') {
                    cantidadPorEstado.set(t.estado, (cantidadPorEstado.get(t.estado) ?? 0) + 1);
                }
            }
            if (cantidadPorEstado.size > 0) {
                const motivos = [...cantidadPorEstado].map(([estado, n]) => MOTIVO_NO_ANULABLE[estado]?.(n));
                throw new ConflictException(`No se anuló ninguno: ${motivos.join('; ')}`);
            }

            const { count } = await tx.ticketEvento.updateMany({
                where: { id: { in: tickets.map((t) => t.id) }, estado: { in: ['Disponible', 'Impreso'] } },
                data: { estado: 'Anulado' },
            });
            this.verificarCantidad(count, tickets.length);
            return { actualizados: count };
        });
    }
}
