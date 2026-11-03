import { useState } from "react";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import CalendarioJornadas from "./CalendarioJornadas";
import { jornadaVacia, type JornadaFormData } from "../utils/jornadaForm";
import { dosDigitos } from "../utils/fechaHora";

type GeneradorJornadasProps = {
    // Cuántas jornadas ya están cargadas: la numeración de las nuevas sigue desde ahí
    cantidadExistente: number;
    // Los días que ya tienen una jornada: el calendario los marca
    diasCargados: Date[];
    // Entrega las filas armadas; el padre las suma a las que ya hay
    onGenerar: (jornadas: JornadaFormData[]) => void;
};

// Cómo se nombran las jornadas generadas: "Día 1", "Fecha 1" o sin nombre
type FormatoNombre = "dia" | "fecha" | "ninguno";

const PALABRA_NOMBRE: Record<FormatoNombre, string> = {
    dia: "Día",
    fecha: "Fecha",
    ninguno: "",
};

// Los valores que comparten todas las jornadas que se van a generar
type ValoresComunes = {
    hora: string;
    duracion: string;
    capacidad: string;
    direccion: string;
};

const valoresVacios: ValoresComunes = {
    hora: "",
    duracion: "",
    capacidad: "",
    direccion: "",
};

/*
    Arma de una vez las jornadas de los días marcados en el calendario, todas
    con el mismo horario, capacidad y dirección. Las filas generadas quedan
    editables en JornadasEditor, así que una excepción se corrige ahí.
*/
const GeneradorJornadas = ({ cantidadExistente, diasCargados, onGenerar }: GeneradorJornadasProps) => {
    const [valores, setValores] = useState<ValoresComunes>(valoresVacios);
    const [formatoNombre, setFormatoNombre] = useState<FormatoNombre>("dia");
    // Los días marcados en el calendario (Date en hora local)
    const [dias, setDias] = useState<Date[]>([]);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValores((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const generar = () => {
        setError("");

        if (dias.length === 0) {
            setError("Marcá al menos un día en el calendario");
            return;
        }
        if (!valores.hora) {
            setError("Ingresá una hora de inicio para las jornadas");
            return;
        }
        if (!valores.duracion || Number(valores.duracion) <= 0) {
            setError("Ingresá una duración mayor a 0 para las jornadas");
            return;
        }
        if (!valores.capacidad || !Number.isInteger(Number(valores.capacidad)) || Number(valores.capacidad) <= 0) {
            setError("Ingresá una capacidad entera mayor a 0");
            return;
        }
        if (!valores.direccion.trim()) {
            setError("Ingresá la dirección de las jornadas");
            return;
        }

        // Se ordena una copia: sort modifica el array, y `dias` es estado de React
        const ordenados = [...dias].sort((a, b) => a.getTime() - b.getTime());

        /*
            La fecha se arma con los datos locales del Date (el calendario ya
            los entrega en hora local) y no con fechaAInputs, que la pasaría a
            hora argentina y podría correr el día si la computadora está en
            otra zona.
        */
        const palabra = PALABRA_NOMBRE[formatoNombre];
        const filas: JornadaFormData[] = ordenados.map((dia, indice) => ({
            ...jornadaVacia(),
            // Con 0 jornadas cargadas la primera es la 1; si ya hay, sigue desde ahí
            nombre: palabra ? `${palabra} ${cantidadExistente + indice + 1}` : "",
            fecha: `${dia.getFullYear()}-${dosDigitos(dia.getMonth() + 1)}-${dosDigitos(dia.getDate())}`,
            hora: valores.hora,
            duracion: valores.duracion,
            capacidad: valores.capacidad,
            direccion: valores.direccion.trim(),
        }));

        onGenerar(filas);
        // Se limpian los días: si no, un segundo clic en el botón duplicaría las filas
        setDias([]);
    };

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
            <span className="text-sm font-semibold text-gray-700">Generar jornadas desde el calendario</span>

            <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col gap-1">
                    <CalendarioJornadas seleccionados={dias} diasCargados={diasCargados} onChange={setDias} />
                    {diasCargados.length > 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Ya tiene una jornada cargada
                        </span>
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500">
                            {dias.length === 0 ? "Marcá los días de las jornadas" : `${dias.length} día(s) marcado(s)`}
                        </span>
                        {dias.length > 0 && (
                            <button
                                type="button"
                                className="cursor-pointer text-xs text-red-600 hover:underline"
                                onClick={() => setDias([])}
                            >
                                Limpiar selección
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex min-w-60 flex-1 flex-col gap-3">
                    <span className="text-sm font-medium text-gray-700">Valores para todas las jornadas</span>
                    <div className="grid grid-cols-3 gap-3">
                        <Input label="Hora" name="hora" type="time" value={valores.hora} onChange={handleChange} />
                        <Input label="Duración (horas)" name="duracion" type="number" min={1} step={1} value={valores.duracion} onChange={handleChange} />
                        <Input label="Capacidad" name="capacidad" type="number" min={1} value={valores.capacidad} onChange={handleChange} />
                    </div>
                    <Input label="Dirección" name="direccion" type="text" value={valores.direccion} onChange={handleChange} />

                    <fieldset className="flex flex-col gap-1">
                        <legend className="mb-1 text-sm font-medium text-gray-700">Nombre de las jornadas</legend>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                            {(
                                [
                                    ["dia", "Día 1, Día 2…"],
                                    ["fecha", "Fecha 1, Fecha 2…"],
                                    ["ninguno", "Sin nombre"],
                                ] as const
                            ).map(([valor, etiqueta]) => (
                                <label key={valor} className="flex cursor-pointer items-center gap-1.5">
                                    <input
                                        type="radio"
                                        name="formato-nombre-jornada"
                                        checked={formatoNombre === valor}
                                        onChange={() => setFormatoNombre(valor)}
                                    />
                                    {etiqueta}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {error && <span className="text-sm text-red-600">{error}</span>}

                    <Btn type="button" variant="secondary" onClick={generar}>
                        Generar jornadas
                    </Btn>
                </div>
            </div>
        </div>
    );
};

export default GeneradorJornadas;
