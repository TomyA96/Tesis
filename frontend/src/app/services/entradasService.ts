import {api} from './api.ts';

// Disponible: publicado (online) o impreso (física). Anulado: cortado para siempre.
export const ESTADOS_ENTRADA = ["Disponible", "Borrador", "Anulado"] as const;
export type EstadoEntrada = typeof ESTADOS_ENTRADA[number];

export interface Entrada {
    id: number;
    idJornada: number;
    descripcion: string;
    precio: number;
    esFisica: boolean;
    estado: EstadoEntrada;
    // Cuántos tickets tiene el lote: se crean todos al publicarlo o imprimirlo
    cantidad: number;
    // Solo cuenta en un lote online publicado: false = venta pausada
    habilitada: boolean;
    vendidos: number;
    anulados: number;
    // Solo cuentan en un lote físico: los que tiene el organizador (Impreso) y los que están en locales (Asignado)
    enMano: number;
    enLocales: number;
}

export interface CreateEntrada {
    // Las entradas son de cada jornada, no del evento
    idJornada: number;
    descripcion: string;
    precio: number;
    esFisica: boolean;
    cantidad: number;
}

export interface UpdateEntrada{
    descripcion?: string;
    precio?: number;
    cantidad?: number;
}

// Los datos de un lote sin la jornada, más las jornadas donde crearlo (uno en cada una)
export interface CreateEntradasLote extends Omit<CreateEntrada, "idJornada"> {
    idsJornadas: number[];
}

// El backend crea un lote en cada jornada elegida, o en ninguna si alguna tiene un problema
export function createEntradasLote(data: CreateEntradasLote) {
    return api.post<Entrada[]>("/entradas/lote", data);
}

export function getEntradasDeJornada(idJornada: number){
    return api.get<Entrada[]>(`/entradas?idJornada=${idJornada}`)
}

// Todos los lotes del evento, de todas sus jornadas (ordenados por fecha de jornada)
export function getEntradasDeEvento(idEvento: number) {
    return api.get<Entrada[]>(`/entradas?idEvento=${idEvento}`);
}

export function createEntrada(entrada: CreateEntrada) {
    return api.post<Entrada>("/entradas", entrada);
}

export function updateEntrada(id: number, newEntrada: UpdateEntrada){
    return api.put<Entrada>(`/entradas/${id}`, newEntrada)
}

export function publicarEntrada(id: number){
    return api.put<Entrada>(`/entradas/${id}/publicar`, {})
}

export function habilitarEntrada(id: number){
    return api.put<Entrada>(`/entradas/${id}/habilitar`, {})
}

export function deshabilitarEntrada(id: number){
    return api.put<Entrada>(`/entradas/${id}/deshabilitar`, {})
}

// Corta el lote para siempre: sus tickets sin vender quedan anulados
export function anularEntrada(id: number){
    return api.put<Entrada>(`/entradas/${id}/anular`, {})
}

// Imprimir lote: crea los tickets físicos y descarga el PDF
export async function imprimirEntrada(id: number, descripcion: string) {
    const blob = await api.postBlob(`/entradas/${id}/imprimir`, {});
    const descripcionSegura = descripcion.replace(/[\\/:*?"<>|]/g, '');
    const url = URL.createObjectURL(blob);

    // <a download> es la forma estándar de forzar una descarga desde JS —
    // se arma al vuelo, se clickea solo, y se descarta. No queda en el DOM.
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-${id}-${descripcionSegura}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export function deleteEntrada(id: number){
    return api.delete(`/entradas/${id}`)
}