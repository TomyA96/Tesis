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
