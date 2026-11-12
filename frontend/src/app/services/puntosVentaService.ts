import { api } from "./api";

export const ESTADOS_PUNTO_VENTA = ["Activo", "Inactivo"] as const;
export type EstadoPuntoVenta = typeof ESTADOS_PUNTO_VENTA[number];
export const opcionesEstadoPuntoVenta = ESTADOS_PUNTO_VENTA.map((estado) => ({ label: estado, value: estado }));

// Un local (quiosco, tienda, municipalidad) al que se le reparten tickets físicos para vender
export interface PuntoVenta {
    id: number;
    nombre: string;
    telefono: string | null;
    estado: EstadoPuntoVenta;
}

export interface CreatePuntoVenta {
    nombre: string;
    telefono?: string;
}

// telefono admite null: undefined es "no lo toques" y null es "borralo" (igual que en proveedores)
export interface UpdatePuntoVenta {
    nombre?: string;
    telefono?: string | null;
    estado?: EstadoPuntoVenta;
}

export function getPuntosVenta() {
    return api.get<PuntoVenta[]>("/puntos-venta");
}

export function createPuntoVenta(puntoVenta: CreatePuntoVenta) {
    return api.post<PuntoVenta>("/puntos-venta", puntoVenta);
}

export function updatePuntoVenta(id: number, data: UpdatePuntoVenta) {
    return api.put<PuntoVenta>(`/puntos-venta/${id}`, data);
}

export function deletePuntoVenta(id: number) {
    return api.delete<PuntoVenta>(`/puntos-venta/${id}`);
}
