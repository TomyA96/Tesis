import { useEffect, useState } from "react";
import { cn } from "../../../../lib/cn";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import CamposJornada from "./CamposJornada";
import GeneradorJornadas from "./GeneradorJornadas";
import {
    estaVacia,
    jornadaVacia,
    ordenarJornadas,
    renumerarJornadas,
    type CampoJornada,
    type JornadaFormData,
} from "../utils/jornadaForm";

type JornadasEditorProps = {
    // La lista vive en el formulario padre (EventoForm): este componente solo la muestra y la modifica
    jornadas: JornadaFormData[];
    // Las jornadas con un problema al enviar: se resaltan y la lista scrollea hasta la primera
    idsConError: string[];
    onChange: (jornadas: JornadaFormData[]) => void;
    /*
        Las que el evento YA tiene guardadas (al agregar a un evento creado).
        No se muestran ni se editan acá, pero cuentan: la numeración sigue
        desde ellas y el generador las marca y controla que no se pisen.
    */
    existentes?: JornadaFormData[];
};

/*
    La lista de jornadas nuevas: el generador más una fila editable por
    jornada. Se usa al crear un evento y al agregarle jornadas a uno creado.
*/
const JornadasEditor = ({ jornadas, idsConError, onChange, existentes = [] }: JornadasEditorProps) => {
    // La jornada que se está por quitar, a la espera de que el usuario confirme
    const [porQuitar, setPorQuitar] = useState<{ idLocal: string; numero: number } | null>(null);

    // La lista scrollea por su cuenta: sin esto el problema podría quedar fuera de la vista
    useEffect(() => {
        if (idsConError.length === 0) return;
        document.getElementById(`tarjeta-${idsConError[0]}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [idsConError]);

    // Las filas en blanco no cuentan: el generador las reemplaza y no entran en la numeración
    const cargadas = jornadas.filter((jornada) => !estaVacia(jornada));

    const agregar = () => {
        // La fila nueva no tiene fecha, así que queda al final
        onChange(ordenarJornadas([...jornadas, jornadaVacia()]));
    };

    const agregarGeneradas = (generadas: JornadaFormData[]) => {
        onChange(ordenarJornadas([...cargadas, ...generadas]));
    };

    const quitar = (idLocal: string) => {
        onChange(jornadas.filter((jornada) => jornada.idLocal !== idLocal));
    };

    const cambiarCampo = (idLocal: string, campo: CampoJornada, valor: string) => {
        onChange(jornadas.map((jornada) => (jornada.idLocal === idLocal ? { ...jornada, [campo]: valor } : jornada)));
    };

    return (
        <div className="flex flex-col gap-4">
            <GeneradorJornadas jornadas={[...existentes, ...cargadas]} onGenerar={agregarGeneradas} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-700">
                    {existentes.length > 0 ? "Jornadas nuevas" : "Jornadas"} ({jornadas.length})
                </span>
                <div className="flex flex-wrap gap-3">
                    {/* Reordena por fecha y renumera los nombres "Día N" / "Fecha N"; los escritos a mano no se tocan */}
                    {jornadas.length > 1 && (
                        <Btn
                            type="button"
                            variant="secondary"
                            onClick={() => onChange(renumerarJornadas(jornadas, existentes.length))}
                        >
                            Reordenar y renumerar
                        </Btn>
                    )}
                    <Btn type="button" variant="outline" onClick={agregar}>
                        + Agregar jornada
                    </Btn>
                </div>
            </div>

            {/* Tarjetas de 21rem como mínimo: en una pantalla ancha entran tres por fila, en una angosta se acomodan solas */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(21rem,1fr))] gap-3">
                {jornadas.map((jornada, indice) => (
                    // key = idLocal y no el índice: así, al quitar una fila del medio, cada una conserva sus valores
                    <div
                        key={jornada.idLocal}
                        id={`tarjeta-${jornada.idLocal}`}
                        className={cn(
                            "flex flex-col gap-2 rounded-lg border p-3",
                            idsConError.includes(jornada.idLocal) ? "border-red-400 bg-red-50/40" : "border-gray-200",
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                                Jornada {existentes.length + indice + 1}
                            </span>
                            {/* Un evento necesita al menos una jornada */}
                            <Btn
                                type="button"
                                variant="danger"
                                size="sm"
                                disabled={jornadas.length === 1}
                                // Una fila en blanco se quita sin preguntar; una con datos pide confirmación
                                onClick={() =>
                                    estaVacia(jornada)
                                        ? quitar(jornada.idLocal)
                                        : setPorQuitar({ idLocal: jornada.idLocal, numero: indice + 1 })
                                }
                            >
                                Quitar
                            </Btn>
                        </div>
                        <CamposJornada
                            datos={jornada}
                            onChange={(campo, valor) => cambiarCampo(jornada.idLocal, campo, valor)}
                        />
                    </div>
                ))}
            </div>

            <ConfirmarAccion
                isOpen={porQuitar !== null}
                title="Quitar jornada"
                mensaje="Quitar la"
                entidad={porQuitar ? `Jornada ${existentes.length + porQuitar.numero}` : undefined}
                onConfirmar={() => {
                    if (porQuitar) quitar(porQuitar.idLocal);
                    setPorQuitar(null);
                }}
                onCancelar={() => setPorQuitar(null)}
            />
        </div>
    );
};

export default JornadasEditor;
