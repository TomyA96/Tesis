import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { PuntoVenta, EstadoPuntoVenta } from "../../services/puntosVentaService";
import Etiqueta, { type ColorEtiqueta } from "../../ui/componentes/Etiqueta";

const colorEstadoPuntoVenta: Record<EstadoPuntoVenta, ColorEtiqueta> = {
    Activo: "verde",
    Inactivo: "gris",
};

export const columnasPuntosVenta: Column<PuntoVenta>[] = [
    {
        key: "id",
        label: "#",
        render: (value) => String(value).padStart(3, "0"),
    },
    {
        key: "nombre",
        label: "Punto de venta",
    },
    {
        key: "telefono",
        label: "Teléfono",
        render: (value) => (value as string | null) ?? "—",
    },
    {
        key: "estado",
        label: "Estado",
        render: (value) => (
            <Etiqueta color={colorEstadoPuntoVenta[value as EstadoPuntoVenta]}>{value as string}</Etiqueta>
        ),
    },
];
