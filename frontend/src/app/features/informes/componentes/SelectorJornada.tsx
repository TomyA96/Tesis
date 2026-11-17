import { cn } from "../../../../lib/cn";
import { nombreDeJornada, useInformeEvento } from "../informeEvento";

/*
    "Todas / Noche 1 / Noche 2": filtra los gráficos de la pestaña a una
    jornada. Con una sola jornada no se muestra: no hay nada que elegir.
*/
const SelectorJornada = () => {
    const { informe, idJornada, setIdJornada } = useInformeEvento();
    if (informe.jornadas.length < 2) return null;

    const opciones = [{ id: null, label: "Todas" }, ...informe.jornadas.map((j) => ({ id: j.id, label: nombreDeJornada(j) }))];

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Jornada:</span>
            {opciones.map((opcion) => (
                <button
                    key={opcion.id ?? "todas"}
                    type="button"
                    onClick={() => setIdJornada(opcion.id)}
                    aria-pressed={idJornada === opcion.id}
                    className={cn(
                        "rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
                        idJornada === opcion.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    )}
                >
                    {opcion.label}
                </button>
            ))}
        </div>
    );
};

export default SelectorJornada;
