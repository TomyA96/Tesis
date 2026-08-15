import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { useState, type FormEvent } from "react";
import { createRubro, opcionesTipoRubro, type TipoRubro } from "../../../services/rubrosService";

type CrearRubroFormProps = {
    onCancel: () => void;
    onCreated: () => void;
};

const CrearRubroForm = ({ onCancel, onCreated }: CrearRubroFormProps) => {
    const [nombre, setNombre] = useState("");
    // Arranca en Gasto porque es el caso más común (publicidad, sonido, seguridad...)
    const [tipo, setTipo] = useState<TipoRubro>("Gasto");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (nombre.trim().length < 3) {
            setError("Ingresá un nombre de al menos 3 caracteres");
            return;
        }

        setGuardando(true);
        try {
            await createRubro({ nombre: nombre.trim(), tipo });
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el rubro");
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
                placeholder="Ej: Publicidad"
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

            {/* Recordatorio de qué significa cada tipo, para no tener que adivinarlo */}
            <p className="text-xs text-gray-500">
                <strong>Ingreso</strong>: solo entra plata · <strong>Gasto</strong>: solo sale plata ·{" "}
                <strong>Mixto</strong>: puede usarse para las dos cosas.
            </p>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4 mt-4">
                <Btn type="submit" disabled={guardando}>
                    {guardando ? "Creando..." : "Crear Rubro"}
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default CrearRubroForm;
