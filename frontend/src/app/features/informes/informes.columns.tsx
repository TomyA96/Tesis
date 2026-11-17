import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { EventoResumen } from "../../services/informesService";
import Etiqueta from "../../ui/componentes/Etiqueta";
import { coloresEstadoEvento } from "../eventos/eventos.columns";
import { fechaArgentina } from "../../utils/zonaHoraria";
import { formatPesosEnteros } from "../../utils/formatoPrecio";
import { cn } from "../../../lib/cn";

// Las columnas de plata alineadas a la derecha, para que los montos se comparen a ojo
const plata = (valor: number) => <span className="block text-right tabular-nums">{formatPesosEnteros(valor)}</span>;

export const columnasResumenAnual: Column<EventoResumen>[] = [
    { key: "nombre", label: "Evento" },
    {
        key: "fechaInicio",
        label: "Fechas",
        // Si empieza y termina el mismo día, una sola fecha
        render: (_, row) => {
            const inicio = fechaArgentina(row.fechaInicio);
            const fin = fechaArgentina(row.fechaFin);
            return <span className="whitespace-nowrap">{inicio === fin ? inicio : `${inicio} al ${fin}`}</span>;
        },
    },
    {
        key: "estado",
        label: "Estado",
        render: (_, row) => <Etiqueta color={coloresEstadoEvento[row.estado]}>{row.estado}</Etiqueta>,
    },
    { key: "entradasVendidas", label: "Entradas vendidas" },
    { key: "asistentes", label: "Asistentes" },
    { key: "recaudado", label: "Recaudado", render: (_, row) => plata(row.recaudado) },
    { key: "gastado", label: "Gastado", render: (_, row) => plata(row.gastado) },
    {
        key: "ganancia",
        label: "Ganancia",
        render: (_, row) => (
            <span className={cn("block text-right font-semibold tabular-nums", row.ganancia < 0 ? "text-rose-700" : "text-slate-900")}>
                {formatPesosEnteros(row.ganancia)}
            </span>
        ),
    },
];
