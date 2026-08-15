import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { Proveedor, EstadoProveedor } from "../../services/proveedoresService";
import type { Rubro } from "../../services/rubrosService";
import Etiqueta, { type ColorEtiqueta } from "../../ui/componentes/Etiqueta";
import { colorTipoRubro } from "./rubros.columns";

const colorEstadoProveedor: Record<EstadoProveedor, ColorEtiqueta> = {
    Activo: "verde",
    Bloqueado: "rojo",
};

export const columnasProveedores: Column<Proveedor>[] = [
    {
        key: "id",
        label: "#",
        render: (value) => String(value).padStart(3, "0"),
    },
    {
        key: "nombre",
        label: "Proveedor",
    },
    {
        key: "email",
        // El email y el teléfono son opcionales: si no están, mostramos un guion
        // en vez de dejar la celda vacía (queda más claro que "no hay dato").
        label: "Email",
        render: (value) => (value as string | null) ?? "—",
    },
    {
        key: "telefono",
        label: "Teléfono",
        render: (value) => (value as string | null) ?? "—",
    },
    {
        key: "rubros",
        label: "Rubros",
        render: (value) => {
            const rubros = value as Rubro[];

            if (rubros.length === 0) return "—";

            return (
                <div className="flex flex-wrap gap-1">
                    {rubros.map((rubro) => (
                        <Etiqueta key={rubro.id} color={colorTipoRubro[rubro.tipo]}>
                            {rubro.nombre}
                        </Etiqueta>
                    ))}
                </div>
            );
        },
    },
    {
        key: "estado",
        label: "Estado",
        render: (value) => (
            <Etiqueta color={colorEstadoProveedor[value as EstadoProveedor]}>{value as string}</Etiqueta>
        ),
    },
];
