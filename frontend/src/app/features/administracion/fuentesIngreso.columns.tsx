import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { FuenteIngreso, EstadoFuenteIngreso } from "../../services/fuentesIngresoService";
import type { Rubro } from "../../services/rubrosService";
import Etiqueta, { type ColorEtiqueta } from "../../ui/componentes/Etiqueta";
import { colorTipoRubro } from "./rubros.columns";

const colorEstadoFuente: Record<EstadoFuenteIngreso, ColorEtiqueta> = {
    Activo: "verde",
    Bloqueado: "rojo",
};

export const columnasFuentesIngreso: Column<FuenteIngreso>[] = [
    {
        key: "id",
        label: "#",
        render: (value) => String(value).padStart(3, "0"),
    },
    {
        key: "nombre",
        label: "Fuente",
    },
    {
        key: "email",
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
            <Etiqueta color={colorEstadoFuente[value as EstadoFuenteIngreso]}>{value as string}</Etiqueta>
        ),
    },
];
