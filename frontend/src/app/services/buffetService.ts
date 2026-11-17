import { api } from "./api";
import type { Producto } from "./productosService";

export const MEDIOS_PAGO_BUFFET = ["Efectivo", "Tarjeta", "QR"] as const;
export type MedioPagoBuffet = typeof MEDIOS_PAGO_BUFFET[number];

/*
    Una venta del buffet. Los montos llegan como texto porque en la base son
    Decimal: envolverlos en Number() antes de formatear o sumar. Una venta
    equivocada no se borra: queda Anulada, con quién y cuándo.
*/
export interface VentaBuffet {
    id: number;
    fechaHora: string;
    total: string;
    medioPago: MedioPagoBuffet;
    estado: "Registrada" | "Anulada";
    fechaAnulacion: string | null;
    usuario: { nombre: string };
    usuarioAnulacion: { nombre: string } | null;
    detalleVenta: {
        cantidad: number;
        precioUnitario: string;
        subtotal: string;
        producto: { id: number; nombre: string };
    }[];
}

// Las ventas de la jornada y los totales de las que valen (las anuladas no suman)
export interface VentasDeJornada {
    ventas: VentaBuffet[];
    cantidad: number;
    total: string;
    porMedioPago: { medioPago: MedioPagoBuffet; total: string }[];
}

// El catálogo de la caja: productos asignados al evento de la jornada y disponibles
export function getProductosBuffet(idJornada: number) {
    return api.get<Producto[]>(`/jornadas/${idJornada}/buffet/productos`);
}

export function getVentasBuffet(idJornada: number) {
    return api.get<VentasDeJornada>(`/jornadas/${idJornada}/buffet/ventas`);
}

// Solo producto y cantidad: los precios y el total los pone el backend
export function registrarVentaBuffet(
    idJornada: number,
    venta: { medioPago: MedioPagoBuffet; items: { idProducto: number; cantidad: number }[] },
) {
    return api.post<VentaBuffet>(`/jornadas/${idJornada}/buffet/ventas`, venta);
}

export function anularVentaBuffet(idJornada: number, idVenta: number) {
    return api.put<VentaBuffet>(`/jornadas/${idJornada}/buffet/ventas/${idVenta}/anular`, {});
}
