import { api } from "./api";
import type { Rubro } from "./rubrosService";

export const ESTADOS_FUENTE_INGRESO = ["Activo", "Bloqueado"] as const;
export type EstadoFuenteIngreso = typeof ESTADOS_FUENTE_INGRESO[number];
export const opcionesEstadoFuenteIngreso = ESTADOS_FUENTE_INGRESO.map((estado) => ({ label: estado, value: estado }));

/*
    Quien le paga al evento: sponsor, puestero que alquila un stand, organismo que
    da un subsidio. Mismo formato que Proveedor: los rubros llegan ya aplanados.
*/
export interface FuenteIngreso {
    id: number;
    nombre: string;
    email: string | null;
    telefono: string | null;
    estado: EstadoFuenteIngreso;
    rubros: Rubro[];
}

export interface CreateFuenteIngreso {
    nombre: string;
    email?: string;
    telefono?: string;
    estado?: EstadoFuenteIngreso;
    idsRubros: number[];
}

// null significa "borralo", undefined "no lo toques" (mismo criterio que proveedores)
export interface UpdateFuenteIngreso {
    nombre?: string;
    email?: string | null;
    telefono?: string | null;
    estado?: EstadoFuenteIngreso;
    idsRubros?: number[];
}

export function getFuentesIngreso() {
    return api.get<FuenteIngreso[]>("/fuentes-ingreso");
}

export function getFuenteIngreso(id: number) {
    return api.get<FuenteIngreso>(`/fuentes-ingreso/${id}`);
}

export function createFuenteIngreso(fuente: CreateFuenteIngreso) {
    return api.post<FuenteIngreso>("/fuentes-ingreso", fuente);
}

export function updateFuenteIngreso(id: number, data: UpdateFuenteIngreso) {
    return api.put<FuenteIngreso>(`/fuentes-ingreso/${id}`, data);
}

export function deleteFuenteIngreso(id: number) {
    return api.delete<FuenteIngreso>(`/fuentes-ingreso/${id}`);
}
