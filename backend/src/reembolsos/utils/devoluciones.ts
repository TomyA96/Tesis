import { EstadoEvento, EstadoTicket, Prisma } from '@prisma/client';

/*
    Reglas de devolución que usan varios servicios (reembolsos, jornadas y
    eventos). Las que escriben reciben la transacción de quien llama, así
    forman parte de la misma operación: todo o nada.
*/

// Solo se devuelven tickets de jornadas que no se hicieron en su fecha
export const JORNADAS_CON_DEVOLUCION: EstadoEvento[] = ['Suspendido', 'Cancelado'];

// Por qué un ticket en cada estado no se puede devolver (el único devolvible es Vendido)
export const MOTIVO_NO_DEVOLVIBLE: Partial<Record<EstadoTicket, string>> = {
    Usado: 'Ya se usó para entrar',
    Reembolsado: 'Ya fue reembolsado',
    Anulado: 'Está anulado',
    Asignado: 'Está en un punto de venta sin rendir: se resuelve en la rendición del local',
    Impreso: 'Nunca se vendió (está en mano del organizador)',
    Disponible: 'Nunca se vendió',
    Reservado: 'Es de una compra que no se pagó',
};

/*
    Al cancelar una jornada (sola o con todo el evento), cada ticket vendido
    online pasa a tener una solicitud de devolución Pendiente: el comprador
    está registrado (orden con sus datos), así que el encargado puede
    devolverle la plata sin que lo pida. Los de la puerta y los de locales no
    tienen comprador registrado: esos se cargan cuando la persona se presenta
    con el ticket. Los gratuitos no tienen nada que devolver.
*/
export const generarDevolucionesPorCancelacion = async (tx: Prisma.TransactionClient, idsJornadas: number[]) => {
    const tickets = await tx.ticketEvento.findMany({
        where: {
            entrada: { idJornada: { in: idsJornadas } },
            estado: 'Vendido',
            idOrden: { not: null },
            precio: { gt: 0 },
            reembolso: null,
        },
        select: { id: true, precio: true },
    });
    if (tickets.length === 0) return 0;

    const { count } = await tx.reembolso.createMany({
        data: tickets.map((t) => ({
            idTicket: t.id,
            origen: 'Cancelacion' as const,
            motivo: 'Jornada cancelada',
            monto: t.precio,
            estado: 'Pendiente' as const,
        })),
        // Un ticket tiene una sola solicitud: si ya tenía una, se deja la que estaba
        skipDuplicates: true,
    });
    return count;
};
