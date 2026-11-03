import { useState } from "react";
import Formulario from "../../../ui/componentes/Formulario";
import Btn from "../../../ui/componentes/Btn";
import CamposJornada from "../componentes/CamposJornada";
import { createJornada, updateJornada, type Jornada } from "../../../services/jornadasService";
import {
    formularioAJornada,
    jornadaAFormulario,
    jornadaVacia,
    type CampoJornada,
    type JornadaFormData,
} from "../utils/jornadaForm";

export type ModoJornadaForm = "crear" | "ver" | "editar";

type JornadaFormProps = {
    modo: ModoJornadaForm;
    // Evento al que pertenece: en modo "crear" es de donde cuelga la jornada nueva
    idEvento: number;
    // La jornada que se muestra o edita; en modo "crear" no hay y arranca vacío
    jornada?: Jornada;
    onCreated: (jornada: Jornada) => void;
    onUpdated: (jornada: Jornada) => void;
    // Descarta lo escrito y vuelve a la vista anterior
    onCancel: () => void;
};

/*
    Una jornada ya existente (ver y editar) o una nueva que se agrega a un
    evento ya creado (crear). Al crear el evento NO se usa: ahí las jornadas
    se cargan con JornadasEditor, junto con el evento.
*/
const JornadaForm = ({ modo, idEvento, jornada, onCreated, onUpdated, onCancel }: JornadaFormProps) => {
    /*
        Valores iniciales: solo se leen en el primer render. Funciona si el
        padre le pasa una key distinta por cada jornada (igual que EventoForm).
    */
    const [datos, setDatos] = useState<JornadaFormData>(jornada ? jornadaAFormulario(jornada) : jornadaVacia());
    const [error, setError] = useState("");

    const handleChange = (campo: CampoJornada, valor: string) => {
        setDatos((prev) => ({ ...prev, [campo]: valor }));
    };

    // El backend rechaza cambiar las fechas de una jornada que ya no está en Borrador
    const fechasDeshabilitadas = modo === "editar" && jornada?.estado !== "Borrador";

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        /*
            TODO: validaciones antes de convertir (capacidad > 0, duración > 0,
            y al crear, que el inicio sea futuro, como hace EventoForm).
            TODO: en modo "editar" con fechasDeshabilitadas, no mandar las
            fechas: el backend responde 409 si llegan en una jornada que no
            está en Borrador.
        */
        try {
            const data = formularioAJornada(datos);
            if (modo === "crear") {
                onCreated(await createJornada(idEvento, data));
            } else if (modo === "editar" && jornada) {
                onUpdated(await updateJornada(jornada.id, data));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar la jornada");
        }
    };

    return (
        <Formulario autoComplete="off" onSubmit={onSubmit}>
            <CamposJornada
                datos={datos}
                onChange={handleChange}
                disabled={modo === "ver"}
                fechasDeshabilitadas={fechasDeshabilitadas}
            />

            {error && <span className="text-sm text-red-600">{error}</span>}

            {/* En modo "ver" no va ningún botón: las acciones de la jornada viven en la página */}
            {modo !== "ver" && (
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    <Btn type="submit">{modo === "crear" ? "Agregar jornada" : "Guardar cambios"}</Btn>
                    <Btn type="button" variant="cancel" onClick={onCancel}>
                        Cancelar
                    </Btn>
                </div>
            )}
        </Formulario>
    );
};

export default JornadaForm;
