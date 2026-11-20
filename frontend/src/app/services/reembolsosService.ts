import { api } from "./api";
import type { EstadoEvento } from "./eventosService";

/*
    Devoluciones de tickets de un evento (solo de jornadas suspendidas o
    canceladas). Los montos llegan como texto porque en la base son Decimal.
*/

export const MEDIOS_DEVOLUCION = ["MercadoPago", "Efectivo", "Transferencia"] as const;
export type MedioDevolucion = typeof MEDIOS_DEVOLUCION[number];
export const nombreMedioDevolucion: Record<MedioDevolucion, string> = {
    MercadoPago: "Mercado Pago",
    Efectivo: "Efectivo",
    Transferencia: "Transferencia",
};

// Procesado = aprobada (el ticket quedó Reembolsado)
export type EstadoReembolso = "Pendiente" | "Procesado" | "Rechazado";
export type OrigenReembolso = "Cancelacion" | "Presencial";

// Un ticket con lo que hace falta para identificarlo y saber cómo se vendió
export interface TicketReembolso {
    id: number;
    numero: string;
    precio: string;
    estado: string;
    // Vendido en la boletería de la puerta
    idVentaPuerta: number | null;
    entrada: {
        id: number;
        descripcion: string;
        esBoleteria: boolean;
        jornada: { id: number; nombre: string | null; fechaHoraInicio: string; estado: EstadoEvento };
    };
    // Vendido por un local (ya rendido)
    puntoVenta: { nombre: string } | null;
    // Vendido online: la orden y el comprador
    orden: { id: number; cliente: { nombre: string; dni: string; email: string; telefono: string | null } | null } | null;
}

export interface SolicitudReembolso {
    id: number;
    origen: OrigenReembolso;
    motivo: string;
    monto: string;
    fechaHora: string;
    estado: EstadoReembolso;
    fechaResolucion: string | null;
    medioDevolucion: MedioDevolucion | null;
    comentario: string | null;
    ticket: TicketReembolso;
    usuario: { nombre: string } | null;
    usuarioRegistro: { nombre: string } | null;
}

export interface JornadaConDevoluciones {
    id: number;
    nombre: string | null;
    fechaHoraInicio: string;
    estado: EstadoEvento;
    entradas: { id: number; descripcion: string; esFisica: boolean }[];
    // Vendidos sin usar que todavía no tienen solicitud
    sinSolicitud: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    montoPendiente: string;
}

export interface ReembolsosDeEvento {
    evento: { id: number; nombre: string };
    jornadas: JornadaConDevoluciones[];
    solicitudes: SolicitudReembolso[];
}

// Un ticket encontrado al buscar, con si se puede devolver o por qué no
export interface TicketBuscado extends TicketReembolso {
    devolvible: boolean;
    motivoNoDevolvible: string | null;
}

export type BusquedaTickets =
    | { codigoQR: string }
    | { idEntrada: number; numero: string }
    | { idOrden: number }
    | { dni: string };

export function getReembolsos(idEvento: number) {
    return api.get<ReembolsosDeEvento>(`/reembolsos?idEvento=${idEvento}`);
}

export function buscarTicketsParaReembolso(idEvento: number, busqueda: BusquedaTickets) {
    return api.post<TicketBuscado[]>("/reembolsos/buscar", { idEvento, ...busqueda });
}

export function registrarReembolsos(idEvento: number, idsTickets: number[], motivo: string) {
    return api.post<{ registradas: number }>("/reembolsos", { idEvento, idsTickets, motivo });
}

export function aprobarReembolsos(idEvento: number, ids: number[], medioDevolucion: MedioDevolucion) {
    return api.put<{ aprobadas: number; rechazadas: number }>("/reembolsos/aprobar", { idEvento, ids, medioDevolucion });
}

export function rechazarReembolso(id: number, comentario: string) {
    return api.put<SolicitudReembolso>(`/reembolsos/${id}/rechazar`, { comentario });
}

// Por dónde se vendió el ticket, para mostrarlo en las listas
export const canalDeVenta = (t: TicketReembolso) =>
    t.orden ? "Online" : t.idVentaPuerta ? "Puerta" : t.puntoVenta ? `Local: ${t.puntoVenta.nombre}` : "—";
