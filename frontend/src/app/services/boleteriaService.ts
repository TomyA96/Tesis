import { api } from "./api";
import type { MedioPagoBuffet } from "./buffetService";

/*
    La boletería de una jornada (venta de entradas en la puerta). Los montos
    llegan como texto porque en la base son Decimal: envolverlos en Number()
    antes de formatear o sumar.
*/

// Normal: azul. Alerta: amarillo (desde el 80 %). Lleno: rojo (desde el 100 %: cada venta es sobreventa)
export type NivelOcupacion = "Normal" | "Alerta" | "Lleno";

export interface OcupacionPuerta {
    capacidad: number;
    // Vendidos, impresos, asignados a locales y reservas pendientes (los online sin vender no cuentan)
    comprometidos: number;
    disponibles: number;
    excedente: number;
    porcentaje: number;
    nivel: NivelOcupacion;
    ingresaron: number;
    vendidosEnPuerta: number;
}

export interface EstadoBoleteria {
    jornada: { id: number; estado: string; capacidad: number; operable: boolean };
    // null: la jornada no tiene configurada la venta en puerta
    boleteria: { id: number; descripcion: string; precio: string; habilitada: boolean } | null;
    ocupacion: OcupacionPuerta;
}

export interface VentaPuerta {
    id: number;
    fechaHora: string;
    cantidad: number;
    precioUnitario: string;
    total: string;
    medioPago: MedioPagoBuffet;
    estado: "Registrada" | "Anulada";
    esSobreventa: boolean;
    fechaAnulacion: string | null;
    reemisiones: number;
    fechaReemision: string | null;
    usuario: { nombre: string };
    usuarioAnulacion: { nombre: string } | null;
    usuarioReemision: { nombre: string } | null;
    // Incluye los anulados al reemitir: quedan a la vista como historial
    tickets: { id: number; numero: string; estado: string }[];
}

export interface VentasPuerta {
    ventas: VentaPuerta[];
    cantidad: number;
    tickets: number;
    sobreventas: number;
    total: string;
    porMedioPago: { medioPago: MedioPagoBuffet; total: string }[];
}

export function getEstadoBoleteria(idJornada: number) {
    return api.get<EstadoBoleteria>(`/jornadas/${idJornada}/boleteria`);
}

export function getVentasPuerta(idJornada: number) {
    return api.get<VentasPuerta>(`/jornadas/${idJornada}/boleteria/ventas`);
}

// Devuelve el PDF de los tickets vendidos, para imprimirlos en el momento
export function venderEnPuerta(
    idJornada: number,
    venta: { cantidad: number; medioPago: MedioPagoBuffet; confirmarSobreventa?: boolean },
) {
    return api.postBlob(`/jornadas/${idJornada}/boleteria/ventas`, venta);
}

export function anularVentaPuerta(idJornada: number, idVenta: number) {
    return api.put<VentaPuerta>(`/jornadas/${idJornada}/boleteria/ventas/${idVenta}/anular`, {});
}

// Anula los tickets de la venta que no entraron y devuelve el PDF de los nuevos
export function reemitirVentaPuerta(idJornada: number, idVenta: number) {
    return api.postBlob(`/jornadas/${idJornada}/boleteria/ventas/${idVenta}/reemitir`, {});
}
