import {api} from './api.ts';

export const ESTADOS_ENTRADA = ["Disponible", "Borrador"] as const;
export type EstadoEntrada = typeof ESTADOS_ENTRADA[number];
//export const opcionesEstadoEntrada = ESTADOS_ENTRADA.map((estado) => ({ label: estado, value: estado }));

export interface Entrada {
    id: number;
    idEvento: number;
    descripcion: string;
    precio: number;
    esFisica: boolean;
    estado: EstadoEntrada;
    cantidad: number | null;
    habilitada: boolean;
    cantidadTicket: number;
}

export interface CreateEntrada {
    idEvento: number;
    descripcion: string;
    precio: number;
    esFisica: boolean;
    cantidad?: number;
}

export interface UpdateEntrada{
    descripcion?: string;
    precio?: number;
    cantidad?: number;
}

export function getEntradas(idEvento: number){
    return api.get<Entrada[]>(`/entradas?idEvento=${idEvento}`)
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