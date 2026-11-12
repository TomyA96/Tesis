import { api } from "./api";

export const ESTADOS_TICKET = ["Disponible", "Reservado", "Impreso", "Asignado", "Vendido", "Usado", "Anulado", "Reembolsado"] as const;
export type EstadoTicket = typeof ESTADOS_TICKET[number];

/*
    Un ticket de un lote. numero es texto en la base ("1", "2"...) pero
    siempre es un número: el backend ya los devuelve ordenados por lote y
    número. precio llega como string porque Prisma serializa los Decimal así.
*/
export interface Ticket {
    id: number;
    numero: string;
    precio: string;
    estado: EstadoTicket;
    entrada: { id: number; descripcion: string; esFisica: boolean };
    puntoVenta: { id: number; nombre: string } | null;
}

type Resultado = { actualizados: number };

export function getTicketsDeJornada(idJornada: number) {
    return api.get<Ticket[]>(`/tickets?idJornada=${idJornada}`);
}

/*
    Asignar o reasignar tickets físicos a un punto de venta. Siempre registra
    una entrega nueva para ese local (con su comprobante); los que ya estaban
    en ese mismo local no cuentan (yaEstaban).
*/
export function asignarTickets(idsTickets: number[], idPuntoVenta: number) {
    return api.put<Resultado & { yaEstaban: number; entrega: { id: number; puntoVenta: { id: number; nombre: string } } }>(
        "/tickets/asignar",
        { idsTickets, idPuntoVenta },
    );
}

// Corrige una asignación: los tickets vuelven a estar en mano (Impreso)
export function quitarAsignacionTickets(idsTickets: number[]) {
    return api.put<Resultado>("/tickets/quitar-asignacion", { idsTickets });
}

// Solo se anulan los que nadie tiene: online a la venta o físicos en mano
export function anularTickets(idsTickets: number[]) {
    return api.put<Resultado>("/tickets/anular", { idsTickets });
}
