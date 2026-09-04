import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import { useState } from "react";
import { reprogramarEvento } from "../../../services/eventosService";
import type { Evento } from "../../../services/eventosService";
import { fechaAInputs, combinarFechaHora, calcularDuracionHoras, sumarDuracion } from "../utils/fechaHora";

type ReprogramarFormProps = {
    evento: Evento;
    onReprogramado: (evento: Evento) => void;
    onCancel: () => void;
};

/*
    A diferencia de EventoForm, este formulario maneja su propia llamada a la
    API y su propio error local (mostrado dentro del modal) — no pasa por
    ejecutarAccion de EventoPage. La razón: si el backend rechaza la fecha
    nueva, el usuario necesita poder corregirla y reintentar sin perder lo que
    ya cargó, algo que el mecanismo de errorAccion (que cierra el modal
    siempre) no permite.
*/
const ReprogramarForm = ({ evento, onReprogramado, onCancel }: ReprogramarFormProps) => {
    const inicioActual = new Date(evento.fechaHoraInicio);
    const finActual = new Date(evento.fechaHoraFin);
    const { fecha: fechaInicial, hora: horaInicial } = fechaAInputs(inicioActual);

    // Precargado con la fecha actual: si no hace falta cambiarla, el usuario
    // puede confirmar tal cual viene (ver la charla sobre por qué esto alcanza
    // para "reactivar sin cambios" sin necesitar una acción aparte).
    const [fecha, setFecha] = useState(fechaInicial);
    const [hora, setHora] = useState(horaInicial);
    const [duracion, setDuracion] = useState(calcularDuracionHoras(inicioActual, finActual));
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const fechaHoraInicio = combinarFechaHora(fecha, hora);

        if (new Date() >= fechaHoraInicio) {
            setError("La nueva fecha de inicio no puede ser en el pasado");
            return;
        }
        if (Number(duracion) <= 0) {
            setError("Introduzca una duración válida");
            return;
        }

        const fechaHoraFin = sumarDuracion(fechaHoraInicio, Number(duracion));

        try {
            const eventoActualizado = await reprogramarEvento(evento.id, { fechaHoraInicio, fechaHoraFin });
            onReprogramado(eventoActualizado);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo reprogramar el evento");
        }
    };

    return (
        <Formulario onSubmit={onSubmit} className="p-6 min-w-[480px]">
            <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">Nueva fecha del evento</span>
                <div className="grid grid-cols-3 gap-3">
                    <Input
                        label="Fecha"
                        name="fecha"
                        type="date"
                        required
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                    <Input
                        label="Hora"
                        name="hora"
                        type="time"
                        required
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                    />
                    <Input
                        label="Duración (horas)"
                        name="duracion"
                        type="number"
                        min={0.5}
                        step={0.5}
                        required
                        value={duracion}
                        onChange={(e) => setDuracion(e.target.value)}
                    />
                </div>
            </div>

            {error && <span className="text-sm text-red-600">{error}</span>}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
                <Btn type="submit">Reprogramar</Btn>
            </div>
        </Formulario>
    );
};

export default ReprogramarForm;
