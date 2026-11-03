import { useState } from "react";
import Formulario from "../../../ui/componentes/Formulario";
import Btn from "../../../ui/componentes/Btn";
import CamposEvento from "../componentes/CamposEvento";
import JornadasEditor from "../componentes/JornadasEditor";
import SelectorImagen from "../componentes/SelectorImagen";
import { createEvento, type EventoConJornadas } from "../../../services/eventosService";
import { subirImagenEvento } from "../../../services/imagenEventoService";
import { eventoVacio, type CampoEvento, type EventoFormData } from "../utils/eventoForm";
import { formularioAJornada, jornadaVacia, type JornadaFormData } from "../utils/jornadaForm";

type CrearEventoFormProps = {
    onCreated: (evento: EventoConJornadas) => void;
};

/*
    Crear un evento nuevo con todas sus jornadas en un solo paso. Es el dueño
    del estado de la pantalla: JornadasEditor y SelectorImagen solo muestran
    lo que reciben y avisan lo que cambia.
*/
const CrearEventoForm = ({ onCreated }: CrearEventoFormProps) => {
    const [datos, setDatos] = useState<EventoFormData>(eventoVacio());
    // Arranca con una fila vacía: un evento necesita al menos una jornada
    const [jornadas, setJornadas] = useState<JornadaFormData[]>([jornadaVacia()]);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [error, setError] = useState("");

    const handleChange = (campo: CampoEvento, valor: string) => {
        setDatos((prev) => ({ ...prev, [campo]: valor }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        /*
            TODO: validaciones antes de convertir. Por cada jornada: capacidad
            > 0, duración > 0 e inicio futuro. Mostrá en qué jornada está el
            problema (ej: "Jornada 2: ...").
        */
        try {
            const evento = await createEvento({
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                jornadas: jornadas.map(formularioAJornada),
            });

            /*
                TODO: el evento YA existe en este punto. Si la imagen falla no
                hay que mostrar "error al crear": avisá que se creó pero la
                imagen no se pudo subir, y navegá igual al detalle.
            */
            if (archivo) await subirImagenEvento(evento.id, archivo);

            onCreated(evento);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el evento");
        }
    };

    return (
        <Formulario autoComplete="off" onSubmit={onSubmit}>
            <h1 className="mb-6 text-2xl font-bold">Nuevo evento</h1>

            {/*
                Dos columnas en PC (se apilan en pantallas chicas): a la
                izquierda los datos del evento, a la derecha las jornadas. La
                columna de jornadas scrollea por su cuenta, así la página no
                se estira cuando hay muchas.
            */}
            <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
                <div className="flex flex-col gap-6">
                    <CamposEvento datos={datos} onChange={handleChange} />
                    <SelectorImagen archivo={archivo} onChange={setArchivo} />
                </div>

                <div className="flex flex-col gap-2 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-2">
                    <span className="text-sm font-semibold text-gray-700">Jornadas</span>
                    {/*
                        TODO (calendario): acá va el calendario con react-day-picker
                        (mode="multiple"), los valores comunes (hora, duración,
                        capacidad, dirección) y debajo la lista de jornadas.
                    */}
                    <JornadasEditor jornadas={jornadas} onChange={setJornadas} />
                </div>
            </div>

            {error && <span className="text-sm text-red-600">{error}</span>}

            <div className="mt-6 flex justify-center border-t border-gray-100 pt-4">
                <Btn type="submit" className="min-w-60">
                    Crear evento
                </Btn>
            </div>
        </Formulario>
    );
};

export default CrearEventoForm;
