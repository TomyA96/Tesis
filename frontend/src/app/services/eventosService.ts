import { api } from "./api";
import type { ImagenEvento } from "./imagenEventoService";
import type { CreateJornada, Jornada } from "./jornadasService";

export const ESTADOS_EVENTO = ["Activo", "Cancelado", "Finalizado", "Suspendido", "Borrador"] as const;
export type EstadoEvento = typeof ESTADOS_EVENTO[number];
export const opcionesEstadoEvento = ESTADOS_EVENTO.map((estado) => ({ label: estado, value: estado }));

/*
    Lo que devuelve la API. Las fechas llegan como string ISO
    ("2026-03-15T20:00:00.000Z") porque response.json() no convierte
    fechas a objetos Date — hay que hacerlo a mano si se necesita.

    El evento ya no guarda fechas, estado, lugar ni capacidad: eso es de
    cada jornada. EventoBase son sus únicos datos propios.
*/
export interface EventoBase {
    id: number;
    nombre: string;
    descripcion: string | null;
}

// Lo que devuelve crear un evento: sus jornadas, pero sin los campos calculados de abajo
export interface EventoConJornadas extends EventoBase {
    jornadas: Jornada[];
}

/*
    Lo que devuelven los listados y el detalle. El backend suma tres campos
    calculados a partir de las jornadas: el inicio de la primera, el fin de la
    última y el estado del evento (Activo si alguna jornada lo está, etc.).
*/
export interface Evento extends EventoConJornadas {
    fechaHoraInicio: string;
    fechaHoraFin: string;
    estado: EstadoEvento;
}

// En las rutas públicas, jornadas trae solo las que están Activas
export interface EventoConImagenes extends Evento {
    imagenes: ImagenEvento[]
}

export interface EntradaPublica {
    id: number;
    descripcion: string;
    precio: string;
}

// Las entradas ya no cuelgan del evento sino de cada jornada
export interface JornadaConEntradas extends Jornada {
    entradas: EntradaPublica[];
}

export interface EventoDetalle extends EventoConImagenes {
    jornadas: JornadaConEntradas[];
}

/*
    Las jornadas viajan dentro del mismo body: el backend crea el evento
    y todas sus jornadas en una sola operación (se guarda todo o nada).
*/
export interface CreateEvento {
    nombre: string;
    descripcion?: string;
    jornadas: CreateJornada[];
}

// Solo datos propios del evento: las jornadas se modifican por separado (jornadasService)
export interface UpdateEvento {
    nombre?: string;
    descripcion?: string;
}

export function getEventos() {
    return api.get<Evento[]>("/eventos");
}

export function getEvento(id:number){
    return api.get<Evento>(`/eventos/${id}`)
}

export function getEventosPublicados() {
    return api.get<Evento[]>("/eventos/publicados");
}

export function getEventosConImagenes(){
    return api.get<EventoConImagenes[]>('/eventos-publicos')
}

export function getEventoPublicado(id:number){
    return api.get<EventoDetalle>(`/eventos-publicos/${id}`)
}

export function createEvento(evento: CreateEvento) {
    return api.post<EventoConJornadas>("/eventos", evento);
}

export function updateEvento(id: number, data: UpdateEvento){
    return api.put<EventoBase>(`/eventos/${id}`, data)
}

export function deleteEvento(id: number){
    return api.delete<EventoBase>(`/eventos/${id}`)
}

/*
    Publicar, cancelar, suspender, finalizar y reprogramar ya no son del evento:
    se hacen por jornada (ver jornadasService). El estado del evento se calcula solo.
*/
