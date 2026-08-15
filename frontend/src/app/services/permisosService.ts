import { api } from "./api";

export interface Permiso{
    id: number;
    codigo: string;
    descripcion: string | null;
}

export function getPermisos() {
    return api.get<Permiso[]>('/permisos')
}