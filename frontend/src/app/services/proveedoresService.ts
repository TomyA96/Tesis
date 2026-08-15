import { api } from "./api";
import type { Rubro } from "./rubrosService";

export const ESTADOS_PROVEEDOR = ["Activo", "Bloqueado"] as const;
export type EstadoProveedor = typeof ESTADOS_PROVEEDOR[number];
export const opcionesEstadoProveedor = ESTADOS_PROVEEDOR.map((estado) => ({ label: estado, value: estado }));

/*
    El backend arma los rubros del proveedor con un include y los aplana, así que
    acá llegan como un array de rubros completos (no como filas de la tabla
    intermedia). Por eso la tabla puede mostrarlos sin pedir nada extra.
*/
export interface Proveedor {
    id: number;
    nombre: string;
    email: string | null;
    telefono: string | null;
    estado: EstadoProveedor;
    rubros: Rubro[];
}

/*
    Al crear/editar viajan solo los ids de los rubros (idsRubros), no los objetos:
    el backend se encarga de armar las filas de proveedores_rubros.
*/
export interface CreateProveedor {
    nombre: string;
    email?: string;
    telefono?: string;
    estado?: EstadoProveedor;
    idsRubros: number[];
}

/*
    email y telefono admiten null en la edición (no solo undefined): undefined
    significa "no lo toques" —JSON.stringify borra la clave— mientras que null
    significa "borralo". Sin el null, vaciar el campo en el formulario no tendría
    forma de limpiarlo en la base.
*/
export interface UpdateProveedor {
    nombre?: string;
    email?: string | null;
    telefono?: string | null;
    estado?: EstadoProveedor;
    idsRubros?: number[];
}

export function getProveedores() {
    return api.get<Proveedor[]>("/proveedores");
}

export function getProveedor(id: number) {
    return api.get<Proveedor>(`/proveedores/${id}`);
}

export function createProveedor(proveedor: CreateProveedor) {
    return api.post<Proveedor>("/proveedores", proveedor);
}

export function updateProveedor(id: number, data: UpdateProveedor) {
    return api.put<Proveedor>(`/proveedores/${id}`, data);
}

export function deleteProveedor(id: number) {
    return api.delete<Proveedor>(`/proveedores/${id}`);
}
