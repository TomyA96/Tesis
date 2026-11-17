import { api } from "./api";
import type { ImagenEvento } from "./imagenEventoService";
import type { CreateJornada, Jornada } from "./jornadasService";

export const ESTADOS_EVENTO = ["Activo", "Cancelado", "Finalizado", "Suspendido", "Borrador"] as const;
export type EstadoEvento = typeof ESTADOS_EVENTO[number];
// El evento solo pasa por estos tres: Suspendido y Cancelado se usan en las jornadas
export const ESTADOS_DEL_EVENTO = ["Borrador", "Activo", "Finalizado"] as const;
export const opcionesEstadoEvento = ESTADOS_DEL_EVENTO.map((estado) => ({ label: estado, value: estado }));

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
    Lo que devuelven los listados y el detalle. El backend suma dos campos
    calculados a partir de las jornadas: el inicio de la primera y el fin de
    la última. El estado sí se guarda: lo cambia el organizador (publicar,
    finalizar, cancelar), nunca cambia solo.
*/
export interface Evento extends EventoConJornadas {
    fechaHoraInicio: string;
    fechaHoraFin: string;
    estado: EstadoEvento;
}

// Una jornada en Borrador y lo que le falta para publicarse (vacío = está completa)
export interface RevisionJornada {
    id: number;
    nombre: string | null;
    fechaHoraInicio: string;
    faltantes: string[];
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

/*
    Las entradas ya no cuelgan del evento sino de cada jornada. Llegan vacías
    si la jornada está agotada o si su venta online ya cerró (unas horas
    antes del inicio): la pantalla la muestra como "Agotada".
*/
export interface JornadaConEntradas extends Jornada {
    ventaOnlineAbierta: boolean;
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

// Un evento activo que ya concluyó todas sus jornadas, con lo que le falta para poder finalizarse
export interface EventoPendienteDeCierre {
    id: number;
    nombre: string;
    fechaHoraFin: string;
    jornadasSinFinalizar: { id: number; nombre: string }[];
    ticketsSinRendir: { puntoVenta: { id: number; nombre: string }; cantidad: number }[];
    jornadasBorrador: number;
}

export function getPendientesDeCierre() {
    return api.get<EventoPendienteDeCierre[]>("/eventos/pendientes-de-cierre");
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

export function getRevisionPublicacion(id: number) {
    return api.get<RevisionJornada[]>(`/eventos/${id}/publicacion`);
}

/*
    Activa el evento (si está en Borrador) y publica todas sus jornadas
    completas. Si hay incompletas, el backend lo rechaza salvo que se mande
    confirmarIncompletas: el usuario tiene que aceptar que esas quedan afuera.
*/
export function publicarEvento(id: number, confirmarIncompletas = false) {
    return api.put<Evento>(`/eventos/${id}/publicar`, { confirmarIncompletas });
}

// Suspende todas las jornadas activas; el evento sigue Activo
export function suspenderEvento(id: number) {
    return api.put<Evento>(`/eventos/${id}/suspender`, {});
}

/*
    Finalizar descarta las jornadas en Borrador. Es irreversible: el backend
    lo rechaza salvo que se mande descartarBorradores.
*/
export function finalizarEvento(id: number, descartarBorradores = false) {
    return api.put<Evento>(`/eventos/${id}/finalizar`, { descartarBorradores });
}

// Cancela todas las jornadas activas o suspendidas; el evento sigue Activo hasta que se finalice
export function cancelarEvento(id: number) {
    return api.put<Evento>(`/eventos/${id}/cancelar`, {});
}
