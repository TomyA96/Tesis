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
export interface OrdenCompraCreada {
    id: number;
    estado: 'Pendiente' | 'Aprobada' | 'Fallida' | 'Cancelada';
    total: string;
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
