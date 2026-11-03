import { useState } from "react";
import Formulario from "../../../ui/componentes/Formulario";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import CamposEvento from "../componentes/CamposEvento";
import { updateEvento, type EventoBase } from "../../../services/eventosService";
import { eventoAFormulario, type CampoEvento, type EventoFormData } from "../utils/eventoForm";

export type ModoEventoForm = "ver" | "editar";

type EventoFormProps = {
    modo: ModoEventoForm;
    // Siempre existe: crear un evento nuevo es CrearEventoForm
    evento: EventoBase;
    onUpdated: (evento: EventoBase) => void;
    // Descarta los cambios y vuelve a "ver"
    onCancel: () => void;
};

/*
    Ver y editar los datos propios de un evento ya creado: nombre y
    descripción. Todo lo demás (fechas, dirección, capacidad) es de las
    jornadas y se edita en JornadaForm.
*/
const EventoForm = ({ modo, evento, onUpdated, onCancel }: EventoFormProps) => {
    /*
        Estos valores iniciales solo se leen en el primer render. Funciona
        porque EventoPage le pasa una key distinta a este formulario por cada
        evento, así que al cambiar de evento se monta uno nuevo.
    */
    const [datos, setDatos] = useState<EventoFormData>(eventoAFormulario(evento));
    const [error, setError] = useState("");
    const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);

    const esModoVer = modo === "ver";

    const handleChange = (campo: CampoEvento, valor: string) => {
        setDatos((prev) => ({ ...prev, [campo]: valor }));
    };

    /*
        TODO: solo tiene sentido confirmar si hay algo que perder. Compará
        `datos` contra eventoAFormulario(evento) (la comparación por JSON
        sirvió en la versión anterior).
    */
    const hayCambios = false;

    // Vuelve a los valores del evento original y sale del modo edición
    const descartarCambios = () => {
        setDatos(eventoAFormulario(evento));
        setError("");
        setConfirmandoCancelar(false);
        onCancel();
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // TODO: validaciones (por ejemplo, nombre no vacío después de trim)
        try {
            onUpdated(await updateEvento(evento.id, { nombre: datos.nombre, descripcion: datos.descripcion }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al modificar el evento");
        }
    };

    return (
        <Formulario autoComplete="off" onSubmit={onSubmit}>
            <CamposEvento datos={datos} onChange={handleChange} disabled={esModoVer} />

            {error && <span className="text-sm text-red-600">{error}</span>}

            {/*
                En modo "ver" no va ningún botón: los campos deshabilitados ya
                comunican que no se está editando, y las acciones (Editar,
                Publicar, etc.) viven en el header de la página.
            */}
            {!esModoVer && (
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    <Btn type="submit">Guardar cambios</Btn>
                    <Btn
                        type="button"
                        variant="cancel"
                        // Si no tocó nada, sale directo sin preguntar
                        onClick={() => (hayCambios ? setConfirmandoCancelar(true) : descartarCambios())}
                    >
                        Cancelar
                    </Btn>
                </div>
            )}

            <ConfirmarAccion
                isOpen={confirmandoCancelar}
                title="Descartar cambios"
                mensaje="Se van a perder las modificaciones que no guardaste. ¿Querés continuar?"
                variante="danger"
                onConfirmar={descartarCambios}
                onCancelar={() => setConfirmandoCancelar(false)}
            />
        </Formulario>
    );
};

export default EventoForm;
