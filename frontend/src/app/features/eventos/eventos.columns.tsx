import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { Evento, EstadoEvento } from "../../services/eventosService";
import Etiqueta from "../../ui/componentes/Etiqueta";
import type { ColorEtiqueta } from "../../ui/componentes/Etiqueta";

/*
    Los estados de evento son distintos a los de usuario, así que no se puede
    reutilizar el renderEstado de genericTabla.utils (que muestra iconos de
    usuario y solo contempla activo/inactivo/bloqueado).
*/
const coloresEstado: Record<EstadoEvento, ColorEtiqueta> = {
    Activo: "verde",
    Borrador: "gris",
    Finalizado: "azul",
    Suspendido: "ambar",
    Cancelado: "rojo",
};



export const columnasEventos: Column<Evento>[] = [
    {
        key: "nombre",
        label: "Evento",
    },
    {
        key: "fechaHoraInicio",
        label: "Fecha",
        // Llega como string ISO desde la API, hay que convertirlo para mostrarlo.
        render: (value) =>
            new Date(value as string).toLocaleDateString("es-AR"),
    },
    {
        key: "fechaHoraInicio",
        label: "Hora",
        render: (value) =>
            new Date(value as string).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    },
    {
        key: "ubicacion",
        label: "Lugar",
    },
    {
        key: "capacidad",
        label: "Capacidad",
    },
    {
        key: "estado",
        label: "Estado",
        render: (value) => <Etiqueta color={coloresEstado[value as EstadoEvento]}>{value as string}</Etiqueta>
    },
];
