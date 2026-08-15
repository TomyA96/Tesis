import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import SelectorRubros from "../componentes/SelectorRubros";
import { useState, type FormEvent } from "react";
import {
    updateProveedor,
    opcionesEstadoProveedor,
    type Proveedor,
    type EstadoProveedor,
    type UpdateProveedor,
} from "../../../services/proveedoresService";
import type { Rubro } from "../../../services/rubrosService";

type EditarProveedorFormProps = {
    proveedor: Proveedor;
    rubros: Rubro[];
    onCancel: () => void;
    onUpdated: () => void;
};

// Compara dos listas de ids sin importar el orden en que están
const mismosIds = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;

    // Copiamos con [...] porque sort() ordena el array original y no queremos tocar el state
    const ordenadaA = [...a].sort((x, y) => x - y);
    const ordenadaB = [...b].sort((x, y) => x - y);

    return ordenadaA.every((id, i) => id === ordenadaB[i]);
};

const EditarProveedorForm = ({ proveedor, rubros, onCancel, onUpdated }: EditarProveedorFormProps) => {
    const [nombre, setNombre] = useState(proveedor.nombre);
    const [email, setEmail] = useState(proveedor.email ?? "");
    const [telefono, setTelefono] = useState(proveedor.telefono ?? "");
    const [estado, setEstado] = useState<EstadoProveedor>(proveedor.estado);
    /*
        El backend ya devuelve los rubros del proveedor dentro del objeto
        (proveedor.rubros), así que la selección inicial sale de ahí sin pedir
        nada extra al servidor.
    */
    const [rubrosSeleccionados, setRubrosSeleccionados] = useState<number[]>(
        proveedor.rubros.map((rubro) => rubro.id),
    );
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const idsOriginales = proveedor.rubros.map((rubro) => rubro.id);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (nombre.trim().length < 3) {
            setError("Ingresá un nombre de al menos 3 caracteres");
            return;
        }
        if (rubrosSeleccionados.length < 1) {
            setError("Debe seleccionar al menos un rubro");
            return;
        }

        // Igual que en usuarios: viaja solo lo que cambió
        const newData: UpdateProveedor = {};
        if (nombre.trim() !== proveedor.nombre) newData.nombre = nombre.trim();
        // Si el campo quedó vacío mandamos null para borrarlo (undefined lo dejaría igual)
        if (email.trim() !== (proveedor.email ?? "")) newData.email = email.trim() || null;
        if (telefono.trim() !== (proveedor.telefono ?? "")) newData.telefono = telefono.trim() || null;
        if (estado !== proveedor.estado) newData.estado = estado;
        if (!mismosIds(rubrosSeleccionados, idsOriginales)) newData.idsRubros = rubrosSeleccionados;

        if (Object.keys(newData).length === 0) {
            setError("No hiciste ningún cambio");
            return;
        }

        setGuardando(true);
        try {
            await updateProveedor(proveedor.id, newData);
            onUpdated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al modificar el proveedor");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Formulario className="w-[40rem] max-w-[calc(100vw-4rem)] gap-5" onSubmit={onSubmit}>
            <Input
                label="Nombre del proveedor"
                name="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <div className="grid grid-cols-3 gap-4">
                <Input
                    label="Email (opcional)"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    label="Teléfono (opcional)"
                    name="telefono"
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />
                <Select
                    label="Estado"
                    name="estado"
                    opciones={opcionesEstadoProveedor}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoProveedor)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-gray-700">Rubros</span>
                    <span className="text-xs text-gray-500">
                        {rubrosSeleccionados.length} seleccionados
                    </span>
                </div>

                <SelectorRubros
                    rubros={rubros}
                    seleccionados={rubrosSeleccionados}
                    onChange={setRubrosSeleccionados}
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
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

export default EditarProveedorForm;
