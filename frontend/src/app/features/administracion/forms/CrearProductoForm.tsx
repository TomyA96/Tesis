import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { useState, type FormEvent } from "react";
import { createProducto, opcionesTipoProducto, type TipoProducto } from "../../../services/productosService";

type CrearProductoFormProps = {
    onCancel: () => void;
    onCreated: () => void;
};

const CrearProductoForm = ({ onCancel, onCreated }: CrearProductoFormProps) => {
    const [nombre, setNombre] = useState("");
    const [tipo, setTipo] = useState<TipoProducto>("Comida");
    /*
        El precio se guarda como string mientras se escribe (es lo que devuelve el
        input) y recién se convierte a número al enviar. Si lo guardáramos como
        number, borrar todo el campo dejaría un NaN dando vueltas.
    */
    const [precio, setPrecio] = useState("");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

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

        setGuardando(true);
        try {
            await createProducto({ nombre: nombre.trim(), tipo, precio: precioNumero });
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el producto");
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
                placeholder="Ej: Empanada de carne"
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
                    // step 0.01 y min 0: plata, con centavos y nunca negativa
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4 mt-4">
                <Btn type="submit" disabled={guardando}>
                    {guardando ? "Creando..." : "Crear Producto"}
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default CrearProductoForm;
