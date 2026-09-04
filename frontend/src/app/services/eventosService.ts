import { api } from "./api";
 
export const ESTADOS_EVENTO = ["Activo", "Cancelado", "Finalizado", "Suspendido", "Borrador"] as const;
export type EstadoEvento = typeof ESTADOS_EVENTO[number];
export const opcionesEstadoEvento = ESTADOS_EVENTO.map((estado) => ({ label: estado, value: estado }));

/*
    Lo que devuelve la API. Las fechas llegan como string ISO
    ("2026-03-15T20:00:00.000Z") porque response.json() no convierte
    fechas a objetos Date — hay que hacerlo a mano si se necesita.
*/
export interface Evento {
    id: number;
    nombre: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    ubicacion: string;
    descripcion: string | null;
    estado: EstadoEvento;
    direccion: string | null;
    capacidad: number;
}

/*

    fechaHoraFin no se pide directamente en el formulario: se calcula
    a partir del inicio más la duración en horas que carga el usuario.

    Las fechas van como Date porque JSON.stringify las convierte
    sola a string ISO al armar el body del request.
*/
export interface CreateEvento {
    nombre: string;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
    ubicacion: string;
    direccion?: string;
    descripcion?: string;
    capacidad: number;
}

export interface UpdateEvento {
    nombre?: string;
    fechaHoraInicio?: Date;
    fechaHoraFin?: Date;
    ubicacion?: string;
    direccion?: string;
    descripcion?: string;
    capacidad?: number;
}

export function getEventos() {
    return api.get<Evento[]>("/eventos");
}

export function getEvento(id:number){
    return api.get<Evento>(`/eventos/${id}`)
}

export function createEvento(evento: CreateEvento) {
    return api.post<Evento>("/eventos", evento);
}

export function updateEvento(id: number, data: UpdateEvento){
    return api.put<Evento>(`/eventos/${id}`, data)
}

export function deleteEvento(id: number){
    return api.delete<Evento>(`/eventos/${id}`)
}

// El endpoint no espera ningún dato (el id de la URL alcanza), pero
// api.put exige un segundo argumento — se manda un objeto vacío.
export function publicarEvento(id: number) {
    return api.put<Evento>(`/eventos/${id}/publicar`, {});
}

export function cancelarEvento(id: number) {
    return api.put<Evento>(`/eventos/${id}/cancelar`, {});
}

export function suspenderEvento(id: number) {
    return api.put<Evento>(`/eventos/${id}/suspender`, {});
}

export function finalizarEvento(id: number) {
    return api.put<Evento>(`/eventos/${id}/finalizar`, {});
}

export function reprogramarEvento(id: number, data: { fechaHoraInicio: Date; fechaHoraFin: Date }) {
    return api.put<Evento>(`/eventos/${id}/reprogramar`, data);
}