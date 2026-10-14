import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { Evento, EstadoEvento } from "../../services/eventosService";
import Etiqueta from "../../ui/componentes/Etiqueta";
import type { ColorEtiqueta } from "../../ui/componentes/Etiqueta";
import { fechaArgentina, horaArgentina } from "../../utils/zonaHoraria";

/*
    Los estados de evento son distintos a los de usuario, así que no se puede
    reutilizar el renderEstado de genericTabla.utils (que muestra iconos de
    usuario y solo contempla activo/inactivo/bloqueado).
*/
export const coloresEstadoEvento: Record<EstadoEvento, ColorEtiqueta> = {
    Activo: "verde",
    Borrador: "indigo",
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
        render: (value) => fechaArgentina(value as string),
    },
    {
        key: "fechaHoraInicio",
        label: "Hora",
        render: (value) => horaArgentina(value as string),
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
        render: (value) => <Etiqueta color={coloresEstadoEvento[value as EstadoEvento]}>{value as string}</Etiqueta>
    },
];
