import Btn from "../../../ui/componentes/Btn";
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
import { inputADia } from "../utils/fechaHora";

type JornadasEditorProps = {
    // La lista vive en el formulario padre (EventoForm): este componente solo la muestra y la modifica
    jornadas: JornadaFormData[];
    onChange: (jornadas: JornadaFormData[]) => void;
};

/*
    La lista de jornadas al CREAR un evento: el generador por rango más una
    fila editable por jornada. Se usa solo en modo crear.
*/
const JornadasEditor = ({ jornadas, onChange }: JornadasEditorProps) => {
    // Las filas en blanco no cuentan: el generador las reemplaza y no entran en la numeración
    const cargadas = jornadas.filter((jornada) => !estaVacia(jornada));
    // Los días del calendario que ya tienen fecha en alguna fila
    const diasCargados = cargadas.filter((jornada) => jornada.fecha).map((jornada) => inputADia(jornada.fecha));

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
            <GeneradorJornadas
                cantidadExistente={cargadas.length}
                diasCargados={diasCargados}
                onGenerar={agregarGeneradas}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-700">Jornadas ({jornadas.length})</span>
                <div className="flex flex-wrap gap-3">
                    {/* Reordena por fecha y renumera los nombres "Día N" / "Fecha N"; los escritos a mano no se tocan */}
                    {jornadas.length > 1 && (
                        <Btn type="button" variant="secondary" onClick={() => onChange(renumerarJornadas(jornadas))}>
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
                    <div key={jornada.idLocal} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Jornada {indice + 1}</span>
                            {/* Un evento necesita al menos una jornada */}
                            <Btn
                                type="button"
                                variant="danger"
                                size="sm"
                                disabled={jornadas.length === 1}
                                onClick={() => quitar(jornada.idLocal)}
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

        </div>
    );
};

export default JornadasEditor;
