import Input from "../../../ui/componentes/Input";
import Textarea from "../../../ui/componentes/Textarea";
import type { CampoEvento, EventoFormData } from "../utils/eventoForm";

type CamposEventoProps = {
    datos: EventoFormData;
    // Avisa al padre qué campo cambió y con qué valor; el padre decide cómo guardarlo
    onChange: (campo: CampoEvento, valor: string) => void;
    // Deshabilita todos los campos (modo "ver")
    disabled?: boolean;
};

/*
    Los campos propios del evento (lo que NO es de ninguna jornada). Los
    comparten CrearEventoForm y EventoForm (ver y editar).
*/
const CamposEvento = ({ datos, onChange, disabled = false }: CamposEventoProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.name as CampoEvento, e.target.value);
    };

    return (
        <div className="flex flex-col gap-4">
            <Input
                label="Nombre del evento"
                name="nombre"
                type="text"
                placeholder="Ej: Expo Tecnología 2026"
                required
                disabled={disabled}
                value={datos.nombre}
                onChange={handleChange}
            />

            <Textarea
                label="Descripción"
                name="descripcion"
                rows={3}
                placeholder="Describí brevemente el evento"
                disabled={disabled}
                value={datos.descripcion}
                onChange={handleChange}
            />
        </div>
    );
};

export default CamposEvento;
