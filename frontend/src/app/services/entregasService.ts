import { api } from "./api";

// Un tramo de números consecutivos: del 151 al 250
export interface Tramo {
    desde: number;
    hasta: number;
}

// Qué sale de cada lote en una entrega (precio como string: Prisma serializa los Decimal así)
export interface DetalleEntrega {
    idEntrada: number;
    descripcion: string;
    jornada: { id: number; nombre: string | null; fechaHoraInicio: string };
    precio: string;
    cantidad: number;
    tramos: Tramo[];
}

/*
    Una entrega ya registrada, para el historial. _count.tickets son los que
    siguen en ella; si es menor que cantidadOriginal, se corrigió después
    (se le quitaron tickets o pasaron a otro local). En 0, quedó anulada.
*/
export interface Entrega {
    id: number;
    fechaHora: string;
    cantidadOriginal: number;
    observacion: string | null;
    puntoVenta: { id: number; nombre: string };
    usuario: { nombre: string };
    _count: { tickets: number };
}

export interface EntregaRegistrada {
    id: number;
    fechaHora: string;
    puntoVenta: { id: number; nombre: string };
    detalle: DetalleEntrega[];
}

export interface CreateEntrega {
    idEvento: number;
    idPuntoVenta: number;
    // Cuántos tickets de cada lote: se toman los que están en mano, de número más bajo
    items: { idEntrada: number; cantidad: number }[];
    observacion?: string;
}

export function getEntregas(idEvento: number) {
    return api.get<Entrega[]>(`/entregas?idEvento=${idEvento}`);
}

// Qué números saldrían: para mostrarlos antes de confirmar. No guarda nada.
export function previaEntrega(data: CreateEntrega) {
    return api.post<DetalleEntrega[]>("/entregas/previa", data);
}

export function registrarEntrega(data: CreateEntrega) {
    return api.post<EntregaRegistrada>("/entregas", data);
}

// Descarga el comprobante en PDF (se puede volver a bajar cuando haga falta)
export async function descargarComprobante(idEntrega: number, nombreLocal: string) {
    const blob = await api.getBlob(`/entregas/${idEntrega}/comprobante`);
    const nombreSeguro = nombreLocal.replace(/[\\/:*?"<>|]/g, "");
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `entrega-${idEntrega}-${nombreSeguro}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 8000);
}

// "#151 al #250, #260"
export const textoTramos = (tramos: Tramo[]) =>
    tramos.map((t) => (t.desde === t.hasta ? `#${t.desde}` : `#${t.desde} al #${t.hasta}`)).join(", ");
