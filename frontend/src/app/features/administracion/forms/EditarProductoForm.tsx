import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { useState, type FormEvent } from "react";
import {
    updateProducto,
    opcionesTipoProducto,
    opcionesEstadoProducto,
    type Producto,
    type TipoProducto,
    type EstadoProducto,
    type UpdateProducto,
} from "../../../services/productosService";

type EditarProductoFormProps = {
    producto: Producto;
    onCancel: () => void;
    onUpdated: () => void;
};

const EditarProductoForm = ({ producto, onCancel, onUpdated }: EditarProductoFormProps) => {
    const [nombre, setNombre] = useState(producto.nombre);
    const [tipo, setTipo] = useState<TipoProducto>(producto.tipo);
    // El precio llega como string desde la API (Decimal), lo dejamos así para el input
    const [precio, setPrecio] = useState(String(producto.precio));
    const [estado, setEstado] = useState<EstadoProducto>(producto.estado);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const precioOriginal = Number(producto.precio);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (nombre.trim().length < 3) {
            setError("Ingresá un nombre de al menos 3 caracteres");
            return;
        }

        const precioNumero = Number(precio);
        if (precio === "" || Number.isNaN(precioNumero) || precioNumero < 0) {
            setError("Ingresá un precio válido");
            return;
        }

        // Viaja solo lo que cambió
        const newData: UpdateProducto = {};
        if (nombre.trim() !== producto.nombre) newData.nombre = nombre.trim();
        if (tipo !== producto.tipo) newData.tipo = tipo;
        // Comparamos números, no strings: "450" y "450.00" son el mismo precio
        if (precioNumero !== precioOriginal) newData.precio = precioNumero;
        if (estado !== producto.estado) newData.estado = estado;

        if (Object.keys(newData).length === 0) {
            setError("No hiciste ningún cambio");
            return;
        }

        setGuardando(true);
        try {
            await updateProducto(producto.id, newData);
            onUpdated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al modificar el producto");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Formulario className="min-w-sm" onSubmit={onSubmit}>
            <Input
                label="Nombre del producto"
                name="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Tipo"
                    name="tipo"
                    opciones={opcionesTipoProducto}
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoProducto)}
                />
                <Input
                    label="Precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                />
            </div>

            <Select
                label="Estado"
                name="estado"
                opciones={opcionesEstadoProducto}
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoProducto)}
            />

            {/* Descontinuado es la salida para los productos que ya se vendieron y no se pueden borrar */}
            <p className="text-xs text-gray-500">
                Un producto <strong>Descontinuado</strong> deja de ofrecerse en el buffet, pero conserva su
                historial de ventas.
            </p>

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

export default EditarProductoForm;
