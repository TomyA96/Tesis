import Input from "../../../ui/componentes/Input";
import type { CampoJornada, JornadaFormData } from "../utils/jornadaForm";

type CamposJornadaProps = {
    datos: JornadaFormData;
    // Avisa al padre qué campo cambió y con qué valor; el padre decide cómo guardarlo
    onChange: (campo: CampoJornada, valor: string) => void;
    // Deshabilita todos los campos (modo "ver")
    disabled?: boolean;
    // Deshabilita solo fecha, hora y duración: la fecha de una jornada solo se edita en Borrador
    fechasDeshabilitadas?: boolean;
};

/*
    Los campos de UNA jornada. Los comparten la fila de JornadasEditor (al
    crear el evento) y JornadaForm (al ver, editar o agregar una jornada).
*/
const CamposJornada = ({ datos, onChange, disabled = false, fechasDeshabilitadas = false }: CamposJornadaProps) => {
    // Se apoya en el atributo name de cada input, que tiene que coincidir con CampoJornada
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.name as CampoJornada, e.target.value);
    };

    /*
        Hay una fila por jornada en la misma pantalla, así que dos inputs
        "fecha" tendrían el mismo id y cada label apuntaría al primero.
        Prefijar el id con idLocal los vuelve únicos.
    */
    const idDe = (campo: CampoJornada) => `${datos.idLocal}-${campo}`;

    return (
        <div className="flex flex-col gap-3">
            <Input
                label="Nombre (opcional)"
                id={idDe("nombre")}
                name="nombre"
                type="text"
                placeholder="Ej: Día 1, Fecha 3"
                disabled={disabled}
                value={datos.nombre}
                onChange={handleChange}
            />

            <Input
                label="Dirección"
                id={idDe("direccion")}
                name="direccion"
                type="text"
                placeholder="Ej: Av. Libertador 1234"
                required
                disabled={disabled}
                value={datos.direccion}
                onChange={handleChange}
            />

            {/* De a dos por fila: en una tarjeta angosta, tres inputs juntos quedan apretados */}
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Fecha"
                    id={idDe("fecha")}
                    name="fecha"
                    type="date"
                    required
                    disabled={disabled || fechasDeshabilitadas}
                    value={datos.fecha}
                    onChange={handleChange}
                />
                <Input
                    label="Hora"
                    id={idDe("hora")}
                    name="hora"
                    type="time"
                    required
                    disabled={disabled || fechasDeshabilitadas}
                    value={datos.hora}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Duración (horas)"
                    id={idDe("duracion")}
                    name="duracion"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Ej: 6"
                    required
                    disabled={disabled || fechasDeshabilitadas}
                    value={datos.duracion}
                    onChange={handleChange}
                />
                <Input
                    label="Capacidad"
                    id={idDe("capacidad")}
                    name="capacidad"
                    type="number"
                    min={1}
                    placeholder="Máx. asistentes"
                    required
                    disabled={disabled}
                    value={datos.capacidad}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default CamposJornada;
