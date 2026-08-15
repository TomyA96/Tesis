import { api } from "./api";

/*
    Un rubro clasifica el dinero que se mueve en un evento:
    - Ingreso: solo entra plata (ej: Sponsors)
    - Gasto:   solo sale plata (ej: Publicidad)
    - Mixto:   puede ser cualquiera de los dos (ej: Buffet, que tiene costos y ventas)
*/
export const TIPOS_RUBRO = ["Ingreso", "Gasto", "Mixto"] as const;
export type TipoRubro = typeof TIPOS_RUBRO[number];
export const opcionesTipoRubro = TIPOS_RUBRO.map((tipo) => ({ label: tipo, value: tipo }));

export interface Rubro {
    id: number;
    nombre: string;
    tipo: TipoRubro;
}

export interface CreateRubro {
    nombre: string;
    tipo: TipoRubro;
}

export interface UpdateRubro {
    nombre?: string;
    tipo?: TipoRubro;
}

export function getRubros() {
    return api.get<Rubro[]>("/rubros");
}

export function getRubro(id: number) {
    return api.get<Rubro>(`/rubros/${id}`);
}

export function createRubro(rubro: CreateRubro) {
    return api.post<Rubro>("/rubros", rubro);
}

export function updateRubro(id: number, data: UpdateRubro) {
    return api.put<Rubro>(`/rubros/${id}`, data);
}

export function deleteRubro(id: number) {
    return api.delete<Rubro>(`/rubros/${id}`);
}
