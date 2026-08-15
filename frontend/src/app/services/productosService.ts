import { api } from "./api";

export const TIPOS_PRODUCTO = ["Comida", "Bebida"] as const;
export type TipoProducto = typeof TIPOS_PRODUCTO[number];
export const opcionesTipoProducto = TIPOS_PRODUCTO.map((tipo) => ({ label: tipo, value: tipo }));

export const ESTADOS_PRODUCTO = ["Disponible", "Descontinuado"] as const;
export type EstadoProducto = typeof ESTADOS_PRODUCTO[number];
export const opcionesEstadoProducto = ESTADOS_PRODUCTO.map((estado) => ({ label: estado, value: estado }));

export interface Producto {
    id: number;
    nombre: string;
    tipo: TipoProducto;
    /*
        precio es Decimal en Prisma y el JSON lo devuelve como string
        ("450.00") para no perder precisión. Por eso el tipo admite los dos
        y siempre hay que envolverlo en Number() antes de formatear o calcular.
    */
    precio: number | string;
    estado: EstadoProducto;
}

export interface CreateProducto {
    nombre: string;
    tipo: TipoProducto;
    precio: number;
    estado?: EstadoProducto;
}

export interface UpdateProducto {
    nombre?: string;
    tipo?: TipoProducto;
    precio?: number;
    estado?: EstadoProducto;
}

export function getProductos() {
    return api.get<Producto[]>("/productos");
}

export function getProducto(id: number) {
    return api.get<Producto>(`/productos/${id}`);
}

export function createProducto(producto: CreateProducto) {
    return api.post<Producto>("/productos", producto);
}

export function updateProducto(id: number, data: UpdateProducto) {
    return api.put<Producto>(`/productos/${id}`, data);
}

export function deleteProducto(id: number) {
    return api.delete<Producto>(`/productos/${id}`);
}
