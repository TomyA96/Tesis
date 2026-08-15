import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Textarea from "../../../ui/componentes/Textarea";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import type { ModoEventoPage } from "../pages/EventoPage";
import {  useState } from "react";
import { cn } from "../../../../lib/cn";

import { createEvento, updateEvento } from "../../../services/eventosService";
import type { Evento, UpdateEvento } from "../../../services/eventosService";
 
type EventoFormProps = {
    evento?:Evento
    modo: ModoEventoPage;
    onCreated: (evento: Evento) => void;
    onUpdated: (evento: Evento) => void;
    // Solo se usa en modo editar: descarta los cambios y vuelve a "ver".
    onCancel: () => void;
};

/*
    La forma que tienen los datos EN EL FORMULARIO, distinta a la de la API:
    todo es string (es lo que devuelve cualquier input), y el fin del evento
    se maneja como duración en horas en vez de como una segunda fecha.
    El onSubmit traduce de esta forma a la que espera el backend.
*/
type EventoFormData = {
    nombre: string;
    ubicacion: string;
    direccion: string;
    descripcion: string;
    capacidad: string;
    fechaIni: string;
    horaIni: string;
    duracion: string;
};

// Los inputs date/time exigen dos dígitos: "03", no "3".
const dosDigitos = (n: number) => String(n).padStart(2, "0");

/*
    Camino inverso al del onSubmit: convierte el evento que viene de la API
    a los valores que necesitan los inputs. Sin evento (modo crear) devuelve
    todo vacío, así que sirve para los dos casos.
*/
const eventoAFormulario = (evento?: Evento): EventoFormData => {
    const base = {
        nombre: evento?.nombre ?? "",
        ubicacion: evento?.ubicacion ?? "",
        direccion: evento?.direccion ?? "",
        descripcion: evento?.descripcion ?? "",
        capacidad: String(evento?.capacidad ?? ""),
    };

    if (!evento) return { ...base, fechaIni: "", horaIni: "", duracion: "" };

    /*
        Se usan los getters locales (getHours y no getUTCHours) a propósito:
        el string que llega de la API está en UTC, y estos lo devuelven en la
        zona del navegador, que es la hora que el usuario realmente cargó.
    */
    const inicio = new Date(evento.fechaHoraInicio);
    const fin = new Date(evento.fechaHoraFin);

    return {
        ...base,
        // getMonth() arranca en 0 (enero), por eso el +1
        fechaIni: `${inicio.getFullYear()}-${dosDigitos(inicio.getMonth() + 1)}-${dosDigitos(inicio.getDate())}`,
        horaIni: `${dosDigitos(inicio.getHours())}:${dosDigitos(inicio.getMinutes())}`,
        duracion: String((fin.getTime() - inicio.getTime()) / (60 * 60 * 1000)),
    };
};

const EventoForm = ({ modo, onCreated, onUpdated, onCancel, evento }: EventoFormProps) => {
    /*
        Estos valores iniciales solo se leen en el primer render. Funciona
        porque EventoPage le pasa una key distinta a este formulario por cada
        evento, así que al cambiar de evento se monta uno nuevo.
    */
    const [datos, setDatos] = useState<EventoFormData>(eventoAFormulario(evento));
    const [error, setError] = useState("");
    const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);

    // Vuelve a los valores del evento original y sale del modo edición.
    const descartarCambios = () => {
        setDatos(eventoAFormulario(evento));
        setError("");
        setConfirmandoCancelar(false);
        onCancel();
    };

    /*
        Solo tiene sentido confirmar si hay algo que perder: si el usuario entró
        a editar y no tocó nada, pedirle confirmación es fricción al pedo.
        Los dos objetos salen de la misma función, así que sus claves están en
        el mismo orden y la comparación por JSON es confiable acá.
    */
    const hayCambios = JSON.stringify(datos) !== JSON.stringify(eventoAFormulario(evento));

    /*
        Un solo handler para todos los campos: se apoya en el atributo name de
        cada input, que tiene que coincidir exacto con la clave de EventoFormData.
        El ...prev es obligatorio: sin él, cada cambio borraría los demás campos.
    */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDatos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const esModoVer = modo === "ver";
 
 
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const fechaHoraInicio = new Date(`${datos.fechaIni}T${datos.horaIni}`);

        if (Number(datos.duracion) <= 0){
            setError("Introduzca una duracion valida")
            return
        }
        if (Number(datos.capacidad) <= 0){
            setError("Introduzca una cantidad de asistentes valida")
            return
        }

        /*
            La duración (en horas) se convierte a fecha de fin sumando
            milisegundos sobre el inicio. Usamos getTime() + un Date nuevo
            en vez de setHours(), porque setHours() mutaría fechaHoraInicio.
        */
        const fechaHoraFin = new Date(
            fechaHoraInicio.getTime() + Number(datos.duracion) * 60 * 60 * 1000
        );

        /*
            Acá se traduce de la forma del formulario a la que espera la API:
            los strings pasan a Date y number, y la duración desaparece
            convertida en fechaHoraFin. El cuerpo es igual para crear y editar.
        */
        const datosEvento = {
            nombre: datos.nombre,
            ubicacion: datos.ubicacion,
            direccion: datos.direccion,
            descripcion: datos.descripcion,
            capacidad: Number(datos.capacidad),
            fechaHoraInicio,
            fechaHoraFin,
        };

        if (modo === "editar"){
            /*
                Se mandan todos los campos, no solo los que cambiaron: reescribir
                un valor con el mismo valor deja la fila igual, así que no hace
                falta comparar contra el original antes de enviar.
            */
            const newData: UpdateEvento = datosEvento;
            try{
                const eventoUpd = await updateEvento(Number(evento?.id), newData)
                onUpdated(eventoUpd)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al modificar el evento");
            }
        } else {
            // Solo al crear: no tiene sentido dar de alta un evento ya pasado.
            if (new Date() >= fechaHoraInicio){
                setError("La fecha de inicio del evento indicada no es valida")
                return
            }

            try{
                const eventoNew = await createEvento(datosEvento)
                onCreated(eventoNew);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al crear el evento");
            }
        }
    }
   
    return (
        <Formulario autoComplete="off" className="p-6" onSubmit={onSubmit}>
 
            {/* ── CAMPOS ────────────────────────────────────────────────────── */}
            {/*
                Una sola columna: el formulario ocupa media pantalla (comparte
                fila con ListaEntradas), así que dos columnas dejarían los
                campos demasiado angostos. La única excepción son fecha+hora,
                que van juntas porque representan un mismo dato.
            */}
            <div className="flex flex-col gap-4">

                <Input
                    label="Nombre del evento"
                    name="nombre"
                    type="text"
                    placeholder="Ej: Expo Tecnología 2026"
                    required
                    disabled={esModoVer}
                    value={datos.nombre}
                    onChange={handleChange}
                />

                <Input
                    label="Lugar"
                    name="ubicacion"
                    type="text"
                    placeholder="Ej: Centro de Convenciones"
                    required
                    disabled={esModoVer}
                    value={datos.ubicacion}
                    onChange={handleChange}
                />

                <Input
                    label="Dirección"
                    name="direccion"
                    type="text"
                    placeholder="Ej: Av. Libertador 1234"
                    disabled={esModoVer}
                    value={datos.direccion}
                    onChange={handleChange}
                />

                {/* Inicio: fecha y hora son un solo dato partido en dos inputs */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                        Inicio del evento
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                        <Input
                            label="Fecha"
                            name="fechaIni"
                            type="date"
                            required
                            disabled={esModoVer}
                            value={datos.fechaIni}
                            onChange={handleChange}
                        />
                        <Input
                            label="Hora"
                            name="horaIni"
                            type="time"
                            required
                            disabled={esModoVer}
                            value={datos.horaIni}
                            onChange={handleChange}
                        />

                        <Input
                            label="Duración (horas)"
                            name="duracion"
                            type="number"
                            min={0.5}
                            step={0.5}
                            placeholder="Ej: 6"
                            required
                            disabled={esModoVer}
                            value={datos.duracion}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/*
                    Duración en horas en vez de fecha+hora de fin: el usuario no
                    tiene que acordarse de cambiar el día en eventos que cruzan
                    la medianoche. El onSubmit la convierte en fechaHoraFin.
                */}
                

                <Input
                    label="Capacidad"
                    name="capacidad"
                    type="number"
                    min={1}
                    placeholder="Cantidad máxima de asistentes"
                    required
                    disabled={esModoVer}
                    value={datos.capacidad}
                    onChange={handleChange}
                />

                <Textarea
                    label="Descripción"
                    name="descripcion"
                    rows={3}
                    placeholder="Describí brevemente el evento"
                    disabled={esModoVer}
                    value={datos.descripcion}
                    onChange={handleChange}
                />

            </div>

            {/* ── BOTONES ───────────────────────────────────────────────────── */}
            {error && <span className="text-sm text-red-600">{error}</span>}
            
               
            {/*
                En modo "ver" no va ningún botón: los campos deshabilitados ya
                comunican que no se está editando, y las acciones del evento
                (Editar, Publicar, etc.) viven en el header de la página.
            */}
            {!esModoVer && (
                <div className={cn("gap-3 mt-6 pt-4 border-t border-gray-100", modo === "editar" ? "grid grid-cols-2" : "flex justify-center")}>
                    {modo === "editar" && (
                        <Btn
                            variant="cancel"
                            type="button"
                            className=""
                            // Si no tocó nada, sale directo sin preguntar.
                            onClick={() =>
                                hayCambios ? setConfirmandoCancelar(true) : descartarCambios()
                            }
                        >
                            Cancelar
                        </Btn>
                    )}
                    <Btn type="submit" className="min-w-[240px]">
                        {modo === "crear" ? "Crear Evento" : "Guardar Cambios"}
                    </Btn>
                </div>
            )}

            <ConfirmarAccion
                isOpen={confirmandoCancelar}
                title="Descartar cambios"
                mensaje="Se van a perder las modificaciones que no realizadas. ¿Querés continuar?"
                variante="danger"
                onConfirmar={descartarCambios}
                onCancelar={() => setConfirmandoCancelar(false)}
            />
            
 
        </Formulario>
    );
};
 
export default EventoForm;