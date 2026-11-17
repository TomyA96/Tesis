import { useState } from "react";
import Leyenda from "./Leyenda";

type EventoResultado = {
    id: number;
    nombre: string;
    ganancia: number;
    // Ganó: % de lo ganado en el año. Perdió: negativo, % de lo perdido.
    contribucion: number;
};

type BarrasResultadoProps = {
    eventos: EventoResultado[];
    formato: (valor: number) => string;
    // Cuántos de arriba (más ganancia) y de abajo (menos ganancia) se ven antes de tocar "Ver más"
    mejores?: number;
    peores?: number;
};

const COLOR_GANO = "#2563EB";
const COLOR_PERDIO = "#E11D48";

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

/*
    Ganancia de cada evento en pesos, desde una línea central: a la derecha
    los que ganaron, a la izquierda (en rojo) los que perdieron. El signo y
    el % también lo dicen, así que no depende solo del color.

    Para que no crezca con muchos eventos se ven siempre la misma cantidad
    de filas: los `mejores` que más ganaron y los `peores` que menos ganaron
    (si hubo pérdidas, son las más grandes). Los del medio quedan detrás de
    "Ver más", que va justo en el lugar donde estarían.
*/
const BarrasResultado = ({ eventos, formato, mejores = 3, peores = 2 }: BarrasResultadoProps) => {
    const [verTodos, setVerTodos] = useState(false);

    const ordenados = [...eventos].sort((a, b) => b.ganancia - a.ganancia);
    const ocultos = ordenados.length - mejores - peores;
    const recortar = ocultos > 0 && !verTodos;
    const arriba = recortar ? ordenados.slice(0, mejores) : ordenados;
    const abajo = recortar ? ordenados.slice(-peores) : [];

    // La escala sale de todos los eventos, no solo de los visibles: así las barras no cambian de largo al abrir "Ver más"
    const max = Math.max(...eventos.map((e) => Math.abs(e.ganancia)), 0);
    const ancho = (valor: number) => (max === 0 ? 0 : (Math.abs(valor) / max) * 100);

    const fila = (evento: EventoResultado) => (
        <div key={evento.id} className="grid grid-cols-[minmax(0,9rem)_1fr_1fr_7.5rem] items-center" title={evento.nombre}>
            <p className="truncate pr-3 text-sm font-medium text-slate-700">{evento.nombre}</p>
            {/* Mitad izquierda: pérdidas, crecen hacia la izquierda desde el centro */}
            <div className="flex h-3 justify-end border-r border-slate-300">
                {evento.ganancia < 0 && (
                    <div className="h-full rounded-l" style={{ width: `${ancho(evento.ganancia)}%`, backgroundColor: COLOR_PERDIO }} />
                )}
            </div>
            {/* Mitad derecha: ganancias */}
            <div className="flex h-3">
                {evento.ganancia > 0 && (
                    <div className="h-full rounded-r" style={{ width: `${ancho(evento.ganancia)}%`, backgroundColor: COLOR_GANO }} />
                )}
            </div>
            <div className="pl-3 text-right leading-tight">
                <p className="text-xs font-semibold tabular-nums text-slate-700">{formato(evento.ganancia)}</p>
                <p className="text-[11px] tabular-nums text-slate-400">{formatoPorcentaje(evento.contribucion)}</p>
            </div>
        </div>
    );

    const boton = (texto: string) => (
        <button
            type="button"
            onClick={() => setVerTodos((prev) => !prev)}
            className="self-start rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
            {texto}
        </button>
    );

    return (
        <div>
            <Leyenda
                series={[
                    { nombre: "Ganancia (% de lo ganado en el año)", color: COLOR_GANO },
                    ...(eventos.some((e) => e.ganancia < 0) ? [{ nombre: "Pérdida (% de lo perdido)", color: COLOR_PERDIO }] : []),
                ]}
            />
            <div className="flex flex-col gap-3">
                {arriba.map(fila)}
                {recortar && boton(`··· Ver ${ocultos} más`)}
                {abajo.map(fila)}
            </div>
            {ocultos > 0 && verTodos && <div className="mt-3">{boton("Ver menos")}</div>}
        </div>
    );
};

export default BarrasResultado;
