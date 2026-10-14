import { api } from "./api";

export const TIPO_MOVIMIENTO = ["Ingreso", "Gasto"] as const
export type TipoMovimiento = typeof TIPO_MOVIMIENTO[number];

/*
    Lo que devuelve la API. monto llega como string porque Prisma serializa
    los Decimal así (para no perder precisión), y fecha como string ISO
    (siempre con hora 00:00:00: la columna es DATE, no tiene hora real).
*/
export interface MovimientoFinanciero{
    id: number;
    idEvento: number;
    idRubro:number;
    idProveedor: number | null;
    idFuente: number | null;
    nroFactura: string | null;
    tipoMovimiento: TipoMovimiento;
    fecha: string;
    monto: string;
    descripcion: string | null;
}

// Lo que devuelven los GET por evento: el backend agrega el nombre del rubro y del proveedor/fuente
export interface GastoEvento extends MovimientoFinanciero {
    rubro: string;
    proveedor: string | null;
}

export interface IngresoEvento extends MovimientoFinanciero {
    rubro: string;
    fuente: string | null;
}

interface CrearMovimiento {
    idEvento: number;
    idRubro: number;
    nroFactura?: string;
    fecha: Date;
    monto: number;
    descripcion?: string;
}

// Un ingreso lleva fuente y un gasto lleva proveedor, nunca los dos
export interface CrearIngreso extends CrearMovimiento {
    idFuente: number;
}

export interface CrearGasto extends CrearMovimiento {
    idProveedor: number;
}

// En la edición todo es opcional; null en factura/descripción significa "borralo"
interface ActualizarMovimiento {
    idRubro?: number;
    fecha?: Date;
    monto?: number;
    nroFactura?: string | null;
    descripcion?: string | null;
}

export interface ActualizarIngreso extends ActualizarMovimiento {
    idFuente?: number;
}

export interface ActualizarGasto extends ActualizarMovimiento {
    idProveedor?: number;
}

export function getGastosEvento(idEvento: number) {
    return api.get<GastoEvento[]>(`/movimiento-financiero/evento/${idEvento}/gastos`)
}

export function getIngresosEvento(idEvento: number) {
    return api.get<IngresoEvento[]>(`/movimiento-financiero/evento/${idEvento}/ingresos`)
}

export function createIngreso(ingreso: CrearIngreso) {
    return api.post<MovimientoFinanciero>('/movimiento-financiero/ingreso', ingreso)
}

export function createGasto(gasto: CrearGasto) {
    return api.post<MovimientoFinanciero>('/movimiento-financiero/gasto', gasto)
}

export function updateIngreso(id: number, data: ActualizarIngreso) {
    return api.put<MovimientoFinanciero>(`/movimiento-financiero/ingreso/${id}`, data)
}

export function updateGasto(id: number, data: ActualizarGasto) {
    return api.put<MovimientoFinanciero>(`/movimiento-financiero/gasto/${id}`, data)
}

export function deleteIngreso(id: number) {
    return api.delete<MovimientoFinanciero>(`/movimiento-financiero/ingreso/${id}`)
}

export function deleteGasto(id: number) {
    return api.delete<MovimientoFinanciero>(`/movimiento-financiero/gasto/${id}`)
}
