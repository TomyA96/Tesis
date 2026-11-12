import { api } from "./api";
import type { EstadoTicket } from "./ticketsService";
import type { PuntoVenta } from "./puntosVentaService";
import type { EstadoEvento } from "./eventosService";

export const TIPOS_COMISION = ["Ninguna", "Porcentaje", "MontoFijo"] as const;
export type TipoComision = typeof TIPOS_COMISION[number];

// Los montos llegan como string: Prisma serializa los Decimal así para no perder precisión

// Un local que tuvo tickets del evento: cuántos le quedan por rendir y cuánto debe
export interface LocalDeEvento {
    puntoVenta: PuntoVenta;
    pendientes: number;
    saldo: string;
}

export interface TicketPendiente {
    id: number;
    numero: string;
    precio: string;
    // Asignado, o Usado si ya pasó por el control de acceso (ese cuenta como vendido sí o sí)
    estado: EstadoTicket;
    entrada: {
        id: number;
        descripcion: string;
        jornada: { id: number; nombre: string | null; fechaHoraInicio: string; estado: EstadoEvento };
    };
}

export interface Pendiente {
    tickets: TicketPendiente[];
    saldoAnterior: string;
}

export interface Rendicion {
    id: number;
    fechaHora: string;
    cantidadVendidos: number;
    cantidadDevueltos: number;
    montoVendido: string;
    tipoComision: TipoComision;
    valorComision: string | null;
    montoComision: string;
    saldoAnterior: string;
    montoRecibido: string;
    saldoPendiente: string;
    observacion: string | null;
    puntoVenta: { id: number; nombre: string };
    usuario: { nombre: string };
}

export interface CreateRendicion {
    idEvento: number;
    idPuntoVenta: number;
    idsVendidos: number[];
    idsDevueltos: number[];
    tipoComision: TipoComision;
    valorComision?: number;
    montoRecibido: number;
    observacion?: string;
}

export function getLocalesDeEvento(idEvento: number) {
    return api.get<LocalDeEvento[]>(`/rendiciones/locales?idEvento=${idEvento}`);
}

export function getPendiente(idEvento: number, idPuntoVenta: number) {
    return api.get<Pendiente>(`/rendiciones/pendiente?idEvento=${idEvento}&idPuntoVenta=${idPuntoVenta}`);
}

export function getRendiciones(idEvento: number) {
    return api.get<Rendicion[]>(`/rendiciones?idEvento=${idEvento}`);
}

export function registrarRendicion(rendicion: CreateRendicion) {
    return api.post<Rendicion>("/rendiciones", rendicion);
}
