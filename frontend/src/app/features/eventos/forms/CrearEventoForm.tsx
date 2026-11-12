import { useState } from "react";
import Formulario from "../../../ui/componentes/Formulario";
import Btn from "../../../ui/componentes/Btn";
import CamposEvento from "../componentes/CamposEvento";
import JornadasEditor from "../componentes/JornadasEditor";
import SelectorImagen from "../componentes/SelectorImagen";
import { createEvento, type EventoConJornadas } from "../../../services/eventosService";
import { subirImagenEvento } from "../../../services/imagenEventoService";
import { eventoVacio, type CampoEvento, type EventoFormData } from "../utils/eventoForm";
import {
    estaVacia,
    formularioAJornada,
    hallarSuperposiciones,
    jornadaVacia,
    validarJornada,
    type JornadaFormData,
} from "../utils/jornadaForm";

type CrearEventoFormProps = {
    // avisoImagen trae el motivo si el evento se creó pero la imagen no se pudo subir
    onCreated: (evento: EventoConJornadas, avisoImagen?: string) => void;
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
    // Las jornadas con el problema que muestra `error`: se resaltan en la lista
    const [idsConError, setIdsConError] = useState<string[]>([]);

    // El aviso y el resaltado de las tarjetas son un mismo problema: se limpian juntos
    const limpiarError = () => {
        setError("");
        setIdsConError([]);
    };

    // Cualquier cambio en el formulario resuelve (o cambia) el problema marcado: se limpia el aviso
    const handleJornadasChange = (nuevas: JornadaFormData[]) => {
        setJornadas(nuevas);
        limpiarError();
    };

    const handleChange = (campo: CampoEvento, valor: string) => {
        setDatos((prev) => ({ ...prev, [campo]: valor }));
        limpiarError();
    };

    const handleArchivoChange = (nuevo: File | null) => {
        setArchivo(nuevo);
        limpiarError();
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        limpiarError();

        if (!datos.nombre.trim()) {
            setError("Ingresá el nombre del evento");
            return;
        }

        // Las filas en blanco no se envían (por ejemplo, la que trae el formulario al abrirse)
        const cargadas = jornadas.filter((jornada) => !estaVacia(jornada));
        if (cargadas.length === 0) {
            setError("Cargá al menos una jornada");
            return;
        }

        // Se recorre la lista completa y no `cargadas`, así el número del mensaje coincide con el título de cada tarjeta
        for (const [indice, jornada] of jornadas.entries()) {
            if (estaVacia(jornada)) continue;
            const problema = validarJornada(jornada);
            if (problema) {
                setError(`Jornada ${indice + 1}: ${problema}`);
                setIdsConError([jornada.idLocal]);
                return;
            }
        }

        const choques = hallarSuperposiciones(jornadas);
        if (choques.length > 0) {
            const [a, b] = choques[0];
            setError(`Las jornadas ${a + 1} y ${b + 1} se superponen`);
            setIdsConError([jornadas[a].idLocal, jornadas[b].idLocal]);
            return;
        }

        let evento: EventoConJornadas;
        try {
            evento = await createEvento({
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion,
                jornadas: cargadas.map(formularioAJornada),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el evento");
            return;
        }

        /*
            Desde acá el evento YA existe. Si la imagen falla no es un "error al
            crear": se guarda el motivo y se navega igual al detalle, donde se
            avisa y se puede volver a subir. Reintentar crear duplicaría el evento.
        */
        let avisoImagen: string | undefined;
        if (archivo) {
            try {
                await subirImagenEvento(evento.id, archivo);
            } catch (err) {
                avisoImagen = err instanceof Error ? err.message : "Error desconocido";
            }
        }

        onCreated(evento, avisoImagen);
    };

    return (
        // noValidate: las validaciones son las de onSubmit, así no aparecen también los globos del navegador por los `required`
        <Formulario autoComplete="off" noValidate onSubmit={onSubmit}>
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
                    <SelectorImagen archivo={archivo} onChange={handleArchivoChange} />
                </div>

                <div className="flex flex-col gap-2 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-2">
                    <JornadasEditor jornadas={jornadas} idsConError={idsConError} onChange={handleJornadasChange} />
                </div>
            </div>

            {error && (
                <span role="alert" className="text-sm font-medium text-red-600">
                    {error}
                </span>
            )}

            <div className="mt-6 flex justify-center border-t border-gray-100 pt-4">
                <Btn type="submit" className="min-w-60">
                    Crear evento
                </Btn>
            </div>
        </Formulario>
    );
};

export default CrearEventoForm;
