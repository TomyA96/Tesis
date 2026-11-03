import { api } from "./api";
import type { EstadoEvento } from "./eventosService";

/*
    Lo que devuelve la API. Las fechas llegan como string ISO porque
    response.json() no las convierte a Date. El estado usa los mismos
    valores que el del evento (Borrador, Activo, Suspendido, etc.).
*/
export interface Jornada {
    id: number;
    idEvento: number;
    nombre: string | null;
    direccion: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    capacidad: number;
    estado: EstadoEvento;
}

/*
    Las fechas van como Date porque JSON.stringify las convierte sola
    a string ISO al armar el body. fechaHoraFin no se pide en el
    formulario: se calcula con inicio + duración, como en el evento.
    El mismo tipo sirve para las jornadas que viajan dentro de
    CreateEvento y para agregar una jornada a un evento ya creado.
*/
export interface CreateJornada {
    nombre?: string;
    direccion: string;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
    capacidad: number;
}

// El backend rechaza cambiar las fechas si la jornada ya no está en Borrador: ahí se usa reprogramar
export type UpdateJornada = Partial<CreateJornada>;

export interface ReprogramarJornada {
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
}

export function getJornadasByEvento(idEvento: number) {
    return api.get<Jornada[]>(`/eventos/${idEvento}/jornadas`);
}

export function getJornada(id: number) {
    return api.get<Jornada>(`/jornadas/${id}`);
}

// Crear cuelga del evento (la jornada todavía no tiene id); el resto trabaja por el id de la jornada
export function createJornada(idEvento: number, data: CreateJornada) {
    return api.post<Jornada>(`/eventos/${idEvento}/jornadas`, data);
}

export function updateJornada(id: number, data: UpdateJornada) {
    return api.put<Jornada>(`/jornadas/${id}`, data);
}

export function deleteJornada(id: number) {
    return api.delete<Jornada>(`/jornadas/${id}`);
}

// Estos endpoints no esperan ningún dato (el id de la URL alcanza), pero
// api.put exige un segundo argumento — se manda un objeto vacío.
export function publicarJornada(id: number) {
    return api.put<Jornada>(`/jornadas/${id}/publicar`, {});
}

export function cancelarJornada(id: number) {
    return api.put<Jornada>(`/jornadas/${id}/cancelar`, {});
}

export function suspenderJornada(id: number) {
    return api.put<Jornada>(`/jornadas/${id}/suspender`, {});
}

export function finalizarJornada(id: number) {
    return api.put<Jornada>(`/jornadas/${id}/finalizar`, {});
}

export function reprogramarJornada(id: number, data: ReprogramarJornada) {
    return api.put<Jornada>(`/jornadas/${id}/reprogramar`, data);
}
