import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { Rubro, TipoRubro } from "../../services/rubrosService";
import Etiqueta, { type ColorEtiqueta } from "../../ui/componentes/Etiqueta";

/*
    El color del tipo de rubro se define una sola vez acá y se reutiliza en el
    selector de rubros del formulario de proveedores, así el mismo concepto se ve
    igual en toda la app.
*/
export const colorTipoRubro: Record<TipoRubro, ColorEtiqueta> = {
    Ingreso: "verde",
    Gasto: "rojo",
    Mixto: "ambar",
};

export const columnasRubros: Column<Rubro>[] = [
    {
        key: "id",
        label: "#",
        render: (value) => String(value).padStart(3, "0"),
    },
    {
        key: "nombre",
        label: "Rubro",
    },
    {
        key: "tipo",
        label: "Tipo",
        render: (value) => (
            <Etiqueta color={colorTipoRubro[value as TipoRubro]}>{value as string}</Etiqueta>
        ),
    },
];
