import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { useState, type FormEvent } from "react";
import {
    updateRubro,
    opcionesTipoRubro,
    type Rubro,
    type TipoRubro,
    type UpdateRubro,
} from "../../../services/rubrosService";

type EditarRubroFormProps = {
    rubro: Rubro;
    onCancel: () => void;
    onUpdated: () => void;
};

const EditarRubroForm = ({ rubro, onCancel, onUpdated }: EditarRubroFormProps) => {
    const [nombre, setNombre] = useState(rubro.nombre);
    const [tipo, setTipo] = useState<TipoRubro>(rubro.tipo);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (nombre.trim().length < 3) {
            setError("Ingresá un nombre de al menos 3 caracteres");
            return;
        }

        /*
            Mismo criterio que en editar usuario: mandamos solo lo que cambió.
            Así el PUT no pisa campos con los mismos valores al pedo y, sobre
            todo, no dispara la validación de nombre duplicado si el nombre
            quedó igual.
        */
        const newData: UpdateRubro = {};
        if (nombre.trim() !== rubro.nombre) newData.nombre = nombre.trim();
        if (tipo !== rubro.tipo) newData.tipo = tipo;

        if (Object.keys(newData).length === 0) {
            setError("No hiciste ningún cambio");
            return;
        }

        setGuardando(true);
        try {
            await updateRubro(rubro.id, newData);
            onUpdated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al modificar el rubro");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Formulario className="min-w-sm" onSubmit={onSubmit}>
            <Input
                label="Nombre del rubro"
                name="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <Select
                label="Tipo"
                name="tipo"
                opciones={opcionesTipoRubro}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRubro)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4 mt-4">
                <Btn type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar Cambios"}
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default EditarRubroForm;
