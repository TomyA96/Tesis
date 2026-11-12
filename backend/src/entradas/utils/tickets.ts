import { randomUUID } from 'crypto';
import { EstadoTicket, Prisma } from '@prisma/client';

/*
    Funciones sobre los tickets de un lote que usan varios servicios
    (entradas, jornadas, eventos, compras). Reciben la transacción de quien
    llama: así forman parte de la misma operación, todo o nada.
*/

// Un ticket Anulado o Reembolsado ya no ocupa un lugar en la jornada
export const TICKETS_QUE_NO_OCUPAN: EstadoTicket[] = ['Anulado', 'Reembolsado'];

type LoteAEmitir = { id: number; cantidad: number; precio: Prisma.Decimal };

/*
    Arma (sin guardar) TODOS los tickets del lote, numerados del 1 a la
    cantidad. Las online nacen Disponibles (a la venta) y las físicas
    Impresas. Separado de guardarlos para que imprimir pueda armar el PDF
    antes: si el PDF falla, no queda nada guardado.
*/
export const armarTicketsDelLote = (entrada: LoteAEmitir, estado: 'Disponible' | 'Impreso') =>
    Array.from({ length: entrada.cantidad }, (_, i) => ({
        idEntrada: entrada.id,
        codigoQR: randomUUID(),
        numero: String(i + 1),
        precio: entrada.precio,
        estado,
    }));

// Publicar un lote online: el lote pasa a Disponible y se crean sus tickets a la venta
export const publicarLoteOnline = async (tx: Prisma.TransactionClient, entrada: LoteAEmitir) => {
    await tx.ticketEvento.createMany({ data: armarTicketsDelLote(entrada, 'Disponible') });
    return tx.entrada.update({ where: { id: entrada.id }, data: { estado: 'Disponible' } });
};

/*
    Al cerrar una jornada, sus tickets que no se vendieron no se borran: se
    anulan, así queda registro de qué se emitió y qué pasó con cada uno (y
    un QR que ande dando vueltas figura como anulado, no como inexistente).

    Igual al finalizar que al cancelar: se anulan los online sin vender y
    los físicos que el organizador tiene en mano (Impreso). Los que están en
    un local (Asignado) NO: el local pudo haber vendido algunos, y eso solo
    se sabe en la rendición. Quedan pendientes hasta que el local rinda.
*/
export const anularTicketsSinVender = async (tx: Prisma.TransactionClient, idsJornadas: number[]) => {
    const estados: EstadoTicket[] = ['Disponible', 'Reservado', 'Impreso'];
    const tickets = { entrada: { idJornada: { in: idsJornadas } }, estado: { in: estados } };

    // Las compras que esperaban el pago de estos tickets ya no se pueden concretar
    await tx.ordenCompra.updateMany({
        where: { estado: 'Pendiente', tickets: { some: tickets } },
        data: { estado: 'Cancelada' },
    });
    await tx.ticketEvento.updateMany({ where: tickets, data: { estado: 'Anulado' } });
};

/*
    Una compra con el pago pendiente aparta sus tickets (Reservado) hasta
    expiraEn. Si venció sin pagarse, esos tickets vuelven a la venta y la
    orden queda Cancelada. No hay un proceso que lo haga a la hora exacta:
    se resuelve "al vuelo", cada vez que alguien necesita esos tickets.
*/
export const liberarReservasVencidas = async (tx: Prisma.TransactionClient, idsEntradas: number[]) => {
    const vencida = { estado: 'Pendiente', expiraEn: { lte: new Date() } } as const;
    const ordenes = await tx.ordenCompra.findMany({
        where: { ...vencida, tickets: { some: { idEntrada: { in: idsEntradas } } } },
        select: { id: true },
    });
    if (ordenes.length === 0) return;

    const idsOrdenes = ordenes.map((o) => o.id);
    await tx.ticketEvento.updateMany({
        where: { idOrden: { in: idsOrdenes }, estado: 'Reservado' },
        data: { estado: 'Disponible', idOrden: null },
    });
    await tx.ordenCompra.updateMany({ where: { id: { in: idsOrdenes } }, data: { estado: 'Cancelada' } });
};

/*
    Cuántos lugares de cada jornada están comprometidos. Un lote en Borrador
    todavía no tiene tickets: cuenta su cantidad. Uno publicado o impreso
    cuenta sus tickets vigentes (los anulados o reembolsados liberan su
    lugar). `excluirIdEntrada` es para editar un lote sin contarlo dos veces.
*/
export const lugaresOcupados = async (
    db: Prisma.TransactionClient,
    idsJornadas: number[],
    excluirIdEntrada?: number,
): Promise<Map<number, number>> => {
    const entradas = await db.entrada.findMany({
        where: {
            idJornada: { in: idsJornadas },
            id: excluirIdEntrada === undefined ? undefined : { not: excluirIdEntrada },
        },
        select: {
            idJornada: true,
            estado: true,
            cantidad: true,
            _count: { select: { tickets: { where: { estado: { notIn: TICKETS_QUE_NO_OCUPAN } } } } },
        },
    });

    const ocupados = new Map<number, number>(idsJornadas.map((id) => [id, 0]));
    for (const entrada of entradas) {
        const lugares = entrada.estado === 'Borrador' ? entrada.cantidad : entrada._count.tickets;
        ocupados.set(entrada.idJornada, (ocupados.get(entrada.idJornada) ?? 0) + lugares);
    }
    return ocupados;
};

/*
    Tickets de un evento que todavía tiene que rendir un local: los que
    tiene en su poder (Asignado) y los que ya pasaron por el control de
    acceso (Usado) sin haber entrado en ninguna rendición. Con
    `idPuntoVenta` se limita a un local.
*/
export const ticketsSinRendir = (idEvento: number, idPuntoVenta?: number): Prisma.TicketEventoWhereInput => ({
    idPuntoVenta: idPuntoVenta ?? { not: null },
    idRendicion: null,
    estado: { in: ['Asignado', 'Usado'] },
    entrada: { jornada: { idEvento } },
});
