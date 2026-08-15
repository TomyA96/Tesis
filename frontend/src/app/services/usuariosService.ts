import { api } from './api';

//export type EstadoUsuario = "Activo" | "Inactivo" | "Bloqueado";
// en usuariosService.ts
export const ESTADOS_USUARIO = ["Activo", "Inactivo", "Bloqueado"] as const;
export type EstadoUsuario = typeof ESTADOS_USUARIO[number];
export const opcionesEstadoUsuario = ESTADOS_USUARIO.map((estado) => ({ label: estado, value: estado }));

export interface Usuario {
    id: number;
    nombre: string;
    usuario: string;
    password: string;
    estado:EstadoUsuario;
    ultimoAcceso: string | null;

}

export interface CreateUsuario {
    usuario: string;
    nombre: string;
    password: string;
    estado?: EstadoUsuario;
}

export interface UpdateUsuario {
    nombre?: string;
    password?: string;
    estado?: EstadoUsuario;
}


export function getUsuarios() {
    return api.get<Usuario[]>('/usuarios');
}

export function createUsuario(usuario: CreateUsuario) {
    return api.post<Usuario>('/usuarios', usuario);
}

export function updateUsuario(id: number, data: UpdateUsuario) {
    return api.put<Usuario>(`/usuarios/${id}`, data);
}

export function deleteUsuario(id: number) {
    return api.delete(`/usuarios/${id}`);
}