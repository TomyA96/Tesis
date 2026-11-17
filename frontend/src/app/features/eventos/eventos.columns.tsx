import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { Evento, EstadoEvento } from "../../services/eventosService";
import Etiqueta from "../../ui/componentes/Etiqueta";
import type { ColorEtiqueta } from "../../ui/componentes/Etiqueta";
import { fechaArgentina } from "../../utils/zonaHoraria";
import { jornadaSinFinalizar } from "./utils/resumenJornadas";

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

/*
    "7/11/2026 – 21/11/2026", o una sola fecha si el evento es de un día.
    Se toma el INICIO de la última jornada y no el fin del evento: una noche
    que termina pasada la medianoche sigue siendo un evento de un día.
*/
const rangoDeFechas = (evento: Evento) => {
    const inicios = evento.jornadas.map((j) => new Date(j.fechaHoraInicio).getTime());
    const desde = fechaArgentina(evento.fechaHoraInicio);
    const hasta = inicios.length > 0 ? fechaArgentina(new Date(Math.max(...inicios))) : desde;
    return desde === hasta ? desde : `${desde} – ${hasta}`;
};

/*
    Hora, lugar y capacidad son de cada jornada: en el listado de eventos
    se muestra el rango de fechas y cuántas jornadas tiene, avisando si
    alguna ya terminó y nadie la finalizó.
*/
export const columnasEventos: Column<Evento>[] = [
    {
        key: "nombre",
        label: "Evento",
    },
    {
        key: "fechaHoraInicio",
        label: "Fechas",
        render: (_, evento) => <span className="whitespace-nowrap">{rangoDeFechas(evento)}</span>,
    },
    {
        key: "jornadas",
        label: "Jornadas",
        render: (_, evento) => {
            const ahora = new Date();
            const sinFinalizar = evento.jornadas.filter((j) => jornadaSinFinalizar(j, ahora)).length;
            return (
                <span className="flex items-center gap-2">
                    {evento.jornadas.length}
                    {sinFinalizar > 0 && <Etiqueta color="ambar">{sinFinalizar} sin finalizar</Etiqueta>}
                </span>
            );
        },
    },
    {
        key: "estado",
        label: "Estado",
        render: (value) => <Etiqueta color={coloresEstadoEvento[value as EstadoEvento]}>{value as string}</Etiqueta>
    },
];
