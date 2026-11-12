import { useState } from "react";
import Modal from "../../../ui/componentes/Modal";
import Btn from "../../../ui/componentes/Btn";
import JornadasEditor from "../componentes/JornadasEditor";
import { createJornadas, type Jornada } from "../../../services/jornadasService";
import {
    estaVacia,
    formularioAJornada,
    hallarSuperposiciones,
    jornadaAFormulario,
    jornadaVacia,
    validarJornada,
    type JornadaFormData,
} from "../utils/jornadaForm";

type AgregarJornadasModalProps = {
    isOpen: boolean;
    idEvento: number;
    // Las que el evento ya tiene: la numeración sigue desde ellas y no se pueden pisar
    jornadasDelEvento: Jornada[];
    onAgregadas: () => void | Promise<void>;
    onCancelar: () => void;
};

/*
    Agrega una o varias jornadas a un evento ya creado, con el mismo editor
    que se usa al crear el evento (generador + filas). Valida igual que
    CrearEventoForm y manda todo junto: el backend las crea todas o ninguna.
*/
const AgregarJornadasModal = ({ isOpen, idEvento, jornadasDelEvento, onAgregadas, onCancelar }: AgregarJornadasModalProps) => {
    // El Modal no renderiza nada cerrado, pero este estado vive acá: al cerrar se reinicia a mano
    const [jornadas, setJornadas] = useState<JornadaFormData[]>([jornadaVacia()]);
    const [error, setError] = useState("");
    const [idsConError, setIdsConError] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    // Las canceladas ya no ocupan su horario ni cuentan para la numeración
    const existentes = jornadasDelEvento.filter((j) => j.estado !== "Cancelado").map(jornadaAFormulario);

    const limpiarError = () => {
        setError("");
        setIdsConError([]);
    };

    const cerrar = () => {
        setJornadas([jornadaVacia()]);
        limpiarError();
        onCancelar();
    };

    const handleChange = (nuevas: JornadaFormData[]) => {
        setJornadas(nuevas);
        limpiarError();
    };

    const guardar = async () => {
        limpiarError();

        const cargadas = jornadas.filter((jornada) => !estaVacia(jornada));
        if (cargadas.length === 0) {
            setError("Cargá al menos una jornada");
            return;
        }
        // Se recorre la lista completa: así el número del mensaje coincide con el de la tarjeta
        for (const [indice, jornada] of jornadas.entries()) {
            if (estaVacia(jornada)) continue;
            const problema = validarJornada(jornada);
            if (problema) {
                setError(`Jornada ${existentes.length + indice + 1}: ${problema}`);
                setIdsConError([jornada.idLocal]);
                return;
            }
        }

        /*
            Las existentes van primero: en cada par [a, b], b es la posición
            mayor, así que b >= existentes.length significa que al menos una
            de las dos es nueva (los choques entre guardadas no son de acá).
        */
        const todas = [...existentes, ...jornadas];
        const choque = hallarSuperposiciones(todas).find(([, b]) => b >= existentes.length);
        if (choque) {
            const [a, b] = choque;
            const nueva = todas[b];
            setError(
                a < existentes.length
                    ? `La jornada ${b + 1} se superpone con una que el evento ya tiene`
                    : `Las jornadas ${a + 1} y ${b + 1} se superponen`,
            );
            setIdsConError(a < existentes.length ? [nueva.idLocal] : [todas[a].idLocal, nueva.idLocal]);
            return;
        }

        setGuardando(true);
        try {
            await createJornadas(idEvento, cargadas.map(formularioAJornada));
            setJornadas([jornadaVacia()]);
            await onAgregadas();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron agregar las jornadas");
        } finally {
            setGuardando(false);
        }
    };

    const cantidad = jornadas.filter((jornada) => !estaVacia(jornada)).length;

    return (
        <Modal isOpen={isOpen} closeModal={cerrar} title="Agregar jornadas">
            {/* Ancho casi completo y scroll propio: el generador y las tarjetas no entran en un modal chico */}
            <div className="flex max-h-[75vh] w-[min(92vw,72rem)] flex-col gap-4 overflow-y-auto pr-1">
                <JornadasEditor
                    jornadas={jornadas}
                    existentes={existentes}
                    idsConError={idsConError}
                    onChange={handleChange}
                />
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
                {error && (
                    <span role="alert" className="text-sm font-medium text-red-600">
                        {error}
                    </span>
                )}
                <div className="flex justify-end gap-3">
                    <Btn variant="cancel" onClick={cerrar} disabled={guardando}>
                        Cancelar
                    </Btn>
                    <Btn onClick={guardar} disabled={guardando || cantidad === 0}>
                        {guardando ? "Guardando..." : `Agregar ${cantidad} jornada${cantidad === 1 ? "" : "s"}`}
                    </Btn>
                </div>
            </div>
        </Modal>
    );
};

export default AgregarJornadasModal;
