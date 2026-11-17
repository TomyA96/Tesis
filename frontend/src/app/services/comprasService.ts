import { api } from './api.ts';

// Lo que se le manda al backend para comprar. No lleva precios ni total:
// los calcula el backend con los precios guardados en la base.
export interface CompraEnviada {
    idEvento: number;
    entradas: { idEntrada: number; cantidad: number }[];
    comprador: {
        nombre: string;
        dni: string;
        email: string;
        telefono?: string;
    };
}

// La orden que devuelve el backend. Los montos llegan como texto porque en
// la base son Decimal: convertirlos con Number() antes de formatearlos.
export type EstadoOrden = 'Pendiente' | 'Aprobada' | 'Fallida' | 'Cancelada';

export interface OrdenCompraCreada {
    id: number;
    estado: EstadoOrden;
    total: string;
    // Link de la pantalla de pago de Mercado Pago. Solo viene si hay algo para cobrar.
    urlPago: string | null;
    // Permite pedir las entradas con sus QR (ver getEntradasDeCompra)
    clave: string;
    detalles: {
        idEntrada: number;
        cantidad: number;
        precioUnitario: string;
        subtotal: string;
        entrada: { descripcion: string };
    }[];
}

export function crearCompra(compra: CompraEnviada) {
    return api.post<OrdenCompraCreada>('/compras', compra);
}

// Para la pantalla a la que se vuelve después de pagar: el backend confirma el pago con Mercado Pago
export function getEstadoCompra(idOrden: number) {
    return api.get<{ id: number; estado: EstadoOrden }>(`/compras/${idOrden}/estado`);
}

// Una entrada comprada, con su QR ya dibujado como imagen (data URL)
export interface EntradaComprada {
    id: number;
    numero: string;
    estado: string;
    entrada: string;
    evento: string;
    jornada: string | null;
    fechaHoraInicio: string;
    direccion: string;
    codigoQR: string;
    imagenQR: string;
}

/*
    Las entradas de una compra aprobada. La clave la da el backend (en la URL
    de vuelta de Mercado Pago, o al crear una compra gratuita): sin ella el
    número de orden solo no alcanza, así nadie puede ver los QR de otro.
*/
export function getEntradasDeCompra(idOrden: number, clave: string) {
    return api.get<EntradaComprada[]>(`/compras/${idOrden}/entradas?clave=${encodeURIComponent(clave)}`);
}
