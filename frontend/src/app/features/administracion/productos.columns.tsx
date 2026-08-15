import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { Producto, TipoProducto, EstadoProducto } from "../../services/productosService";
import { formatPrecio } from "../../utils/formatoPrecio";
import Etiqueta, { type ColorEtiqueta } from "../../ui/componentes/Etiqueta";

export const colorTipoProducto: Record<TipoProducto, ColorEtiqueta> = {
    Comida: "ambar",
    Bebida: "azul",
};

const colorEstadoProducto: Record<EstadoProducto, ColorEtiqueta> = {
    Disponible: "verde",
    Descontinuado: "gris",
};

export const columnasProductos: Column<Producto>[] = [
    {
        key: "id",
        label: "#",
        render: (value) => String(value).padStart(3, "0"),
    },
    {
        key: "nombre",
        label: "Producto",
    },
    {
        key: "tipo",
        label: "Tipo",
        render: (value) => (
            <Etiqueta color={colorTipoProducto[value as TipoProducto]}>{value as string}</Etiqueta>
        ),
    },
    {
        key: "precio",
        label: "Precio",
        // El precio llega como string (Decimal de Prisma) — Number() antes de formatear.
        render: (value) => (
            <span className="tabular-nums">{formatPrecio(Number(value))}</span>
        ),
    },
    {
        key: "estado",
        label: "Estado",
        render: (value) => (
            <Etiqueta color={colorEstadoProducto[value as EstadoProducto]}>{value as string}</Etiqueta>
        ),
    },
];
