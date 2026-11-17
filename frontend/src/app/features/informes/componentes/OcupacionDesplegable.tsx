import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../../lib/cn";
import type { EventoResumen } from "../../../services/informesService";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";

type OcupacionDesplegableProps = {
    eventos: EventoResumen[];
    // Cuántos eventos se ven antes de tocar "Ver todos"
    maximo?: number;
};

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

type BarraProps = { porcentaje: number; detalle: string; tenue?: boolean };

// La barra va de 0 a 100% (la capacidad), así que se compara contra el lugar que había, no contra el resto de los eventos
const BarraOcupacion = ({ porcentaje, detalle, tenue = false }: BarraProps) => (
    <>
        <div className="h-2.5 rounded-r bg-slate-100">
            <div
                className={cn("h-full rounded-r", tenue ? "bg-blue-300" : "bg-blue-600")}
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
        </div>
        <span className="text-right text-xs font-semibold text-slate-600">{formatoPorcentaje(porcentaje)}</span>
        <span className="text-right text-xs text-slate-400">{detalle}</span>
    </>
);

/*
    Ocupación de cada evento (asistentes sobre capacidad de sus jornadas ya
    realizadas). Un evento con más de una jornada se puede abrir para ver la
    ocupación de cada una. Van del más lleno al más vacío (los que todavía no
    tuvieron jornadas, al final), y se ven los primeros `maximo`.
*/
const OcupacionDesplegable = ({ eventos, maximo = 5 }: OcupacionDesplegableProps) => {
    const [abiertos, setAbiertos] = useState<Set<number>>(new Set());
    const [verTodos, setVerTodos] = useState(false);

    const ordenados = [...eventos].sort((a, b) => (b.ocupacion.porcentaje ?? -1) - (a.ocupacion.porcentaje ?? -1));
    const visibles = verTodos ? ordenados : ordenados.slice(0, maximo);
    const ocultos = ordenados.length - maximo;

    const alternar = (id: number) =>
        setAbiertos((prev) => {
            const nuevos = new Set(prev);
            if (nuevos.has(id)) nuevos.delete(id);
            else nuevos.add(id);
            return nuevos;
        });

    const columnas = "grid grid-cols-[minmax(0,9rem)_1fr_3.5rem_5.5rem] items-center gap-3";

    return (
        <div className="flex flex-col gap-1">
            {visibles.map((evento) => {
                const { porcentaje, asistentes, capacidad, jornadas } = evento.ocupacion;
                const desplegable = jornadas.length > 1;
                const abierto = abiertos.has(evento.id);

                return (
                    <div key={evento.id}>
                        <button
                            type="button"
                            disabled={!desplegable}
                            onClick={() => alternar(evento.id)}
                            aria-expanded={desplegable ? abierto : undefined}
                            className={cn(columnas, "w-full rounded-lg px-1 py-1.5 text-left", desplegable && "hover:bg-slate-50 cursor-pointer")}
                        >
                            <span className="flex min-w-0 items-center gap-1">
                                <ChevronRight
                                    className={cn(
                                        "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
                                        abierto && "rotate-90",
                                        !desplegable && "invisible",
                                    )}
                                />
                                <span className="truncate text-sm font-medium text-slate-700">{evento.nombre}</span>
                            </span>
                            {porcentaje === null ? (
                                <span className="col-span-3 text-xs text-slate-400">Sin jornadas realizadas</span>
                            ) : (
                                <BarraOcupacion porcentaje={porcentaje} detalle={`${asistentes} / ${capacidad}`} />
                            )}
                        </button>

                        {abierto &&
                            jornadas.map((jornada) => (
                                <div key={jornada.id} className={cn(columnas, "px-1 py-1")}>
                                    <span className="truncate pl-5 text-xs text-slate-500">
                                        {jornada.nombre || fechaCortaConDia(jornada.fechaHoraInicio)}
                                    </span>
                                    <BarraOcupacion
                                        tenue
                                        porcentaje={jornada.porcentaje ?? 0}
                                        detalle={`${jornada.asistentes} / ${jornada.capacidad}`}
                                    />
                                </div>
                            ))}
                    </div>
                );
            })}

            {ocultos > 0 && (
                <button
                    type="button"
                    onClick={() => setVerTodos((prev) => !prev)}
                    className="mt-2 self-start rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                    {verTodos ? "Ver menos" : `Ver todos (${ocultos} más)`}
                </button>
            )}
        </div>
    );
};

export default OcupacionDesplegable;
