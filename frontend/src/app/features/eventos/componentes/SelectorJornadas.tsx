import Etiqueta from "../../../ui/componentes/Etiqueta";
import { cn } from "../../../../lib/cn";
import { coloresEstadoEvento } from "../eventos.columns";
import { fechaAInputs } from "../utils/fechaHora";
import type { Jornada } from "../../../services/jornadasService";

type SelectorJornadasProps = {
    jornadas: Jornada[];
    // null = todavía no se eligió ninguna
    idSeleccionada: number | null;
    onSelect: (idJornada: number) => void;
};

/*
    Pestañas para pasar de una jornada a otra en el detalle del evento. No
    guarda nada: la jornada elegida vive en la página (estado o URL), porque
    la comparten el formulario de la jornada y la lista de entradas.
*/
const SelectorJornadas = ({ jornadas, idSeleccionada, onSelect }: SelectorJornadasProps) => {
    return (
        <nav role="tablist" aria-label="Jornadas del evento" className="flex flex-wrap gap-2">
            {jornadas.map((jornada, indice) => {
                const seleccionada = jornada.id === idSeleccionada;
                return (
                    <button
                        key={jornada.id}
                        type="button"
                        role="tab"
                        aria-selected={seleccionada}
                        onClick={() => onSelect(jornada.id)}
                        className={cn(
                            "flex cursor-pointer flex-col items-start gap-1 rounded-lg border px-4 py-2 text-left text-sm transition-colors",
                            seleccionada
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50",
                        )}
                    >
                        <span className="font-semibold text-gray-800">
                            {jornada.nombre ?? `Jornada ${indice + 1}`}
                        </span>
                        {/* TODO: mostrar la fecha en formato legible (ej: "vie 20 nov") en vez de AAAA-MM-DD */}
                        <span className="text-xs text-gray-500">
                            {fechaAInputs(new Date(jornada.fechaHoraInicio)).fecha}
                        </span>
                        <Etiqueta color={coloresEstadoEvento[jornada.estado]}>{jornada.estado}</Etiqueta>
                    </button>
                );
            })}
        </nav>
    );
};

export default SelectorJornadas;
