import Formulario from "../../../ui/componentes/Formulario";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import { useState } from "react";
import type { Rubro } from "../../../services/rubrosService";
import type { Proveedor } from "../../../services/proveedoresService";
import { createGasto, updateGasto, type GastoEvento } from "../../../services/movimientoFinancieroService";

// Todo viaja como string mientras vive en el formulario; se convierte al enviar.
export type GastoFormData = {
    idRubro: string;
    idProveedor: string;
    nroFactura: string;
    fecha: string;
    monto: string;
    descripcion: string;
};

type GastosFormProps = {
    idEvento: number;
    rubros: Rubro[];
    proveedores: Proveedor[];
    // Si viene, el formulario edita ese gasto en vez de crear uno nuevo
    registro?: GastoEvento;
    onSaved: () => void;
    onCancel: () => void;
};

const gastoAFormulario = (registro?: GastoEvento): GastoFormData => ({
    idRubro: registro ? String(registro.idRubro) : "",
    idProveedor: registro?.idProveedor ? String(registro.idProveedor) : "",
    nroFactura: registro?.nroFactura ?? "",
    // La API manda ISO completo; el input date necesita solo "YYYY-MM-DD"
    fecha: registro ? registro.fecha.split("T")[0] : "",
    monto: registro?.monto ?? "",
    descripcion: registro?.descripcion ?? "",
});

const GastosForm = ({ idEvento, rubros, proveedores, registro, onSaved, onCancel }: GastosFormProps) => {
    const [datos, setDatos] = useState<GastoFormData>(gastoAFormulario(registro));
    const [error, setError] = useState("");

    // Un gasto solo puede ir a un rubro de tipo Gasto o Mixto (el rubro actual del registro siempre se muestra)
    const opcionesRubros = [
        { label: "Seleccione un rubro", value: "", disabled: true },
        ...rubros
            .filter((rubro) => rubro.tipo !== "Ingreso" || rubro.id === registro?.idRubro)
            .map((rubro) => ({ label: rubro.nombre, value: rubro.id })),
    ];

    /*
        Proveedores activos que trabajan en el rubro elegido. Al editar, el proveedor
        que ya tenía el gasto se sigue mostrando aunque hoy esté bloqueado: mientras no
        cambie rubro ni proveedor, el backend tampoco lo vuelve a validar.
    */
    const proveedoresDelRubro = proveedores
        .filter((proveedor) => {
            const esElActual =
                proveedor.id === registro?.idProveedor && Number(datos.idRubro) === registro?.idRubro;
            const disponible =
                proveedor.estado === "Activo" &&
                proveedor.rubros.some((rubro) => rubro.id === Number(datos.idRubro));
            return esElActual || disponible;
        })
        .map((proveedor) => ({ label: proveedor.nombre, value: proveedor.id }));

    const textoPlaceholderProveedor =
        datos.idRubro === "" ? "Primero elegí un rubro"
        : proveedoresDelRubro.length === 0 ? "No hay proveedores activos para este rubro"
        : "Seleccione un proveedor";

    const opcionesProveedores = [
        { label: textoPlaceholderProveedor, value: "", disabled: true },
        ...proveedoresDelRubro,
    ];

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (registro) {
                // null borra factura/descripción si se vaciaron
                await updateGasto(registro.id, {
                    idRubro: Number(datos.idRubro),
                    idProveedor: Number(datos.idProveedor),
                    nroFactura: datos.nroFactura.trim() || null,
                    fecha: new Date(datos.fecha),
                    monto: parseFloat(datos.monto),
                    descripcion: datos.descripcion.trim() || null,
                });
            } else {
                await createGasto({
                    idEvento,
                    idRubro: Number(datos.idRubro),
                    idProveedor: Number(datos.idProveedor),
                    nroFactura: datos.nroFactura.trim() || undefined,
                    fecha: new Date(datos.fecha),
                    monto: parseFloat(datos.monto),
                    descripcion: datos.descripcion.trim() || undefined,
                });
            }
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al guardar el gasto");
        }
    };

    return (
        <Formulario className="min-w-[400px]" onSubmit={onSubmit}>
            <Select label="Rubro" name="idRubro"
                opciones={opcionesRubros}
                value={datos.idRubro}
                // Cambiar de rubro invalida el proveedor elegido: puede no trabajar en el nuevo
                onChange={(e) => setDatos({ ...datos, idRubro: e.target.value, idProveedor: "" })}
                required
            />
            <Select label="Proveedor" name="idProveedor"
                opciones={opcionesProveedores}
                value={datos.idProveedor}
                onChange={(e) => setDatos({ ...datos, idProveedor: e.target.value })}
                disabled={datos.idRubro === ""}
                required
            />
            <Input label="Fecha" name="fecha" type="date"
                value={datos.fecha}
                onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
                required
            />
            <Input label="Monto" name="monto" type="number" placeholder="Ingresar el monto"
                min={0.01}
                step={0.01}
                value={datos.monto}
                onChange={(e) => setDatos({ ...datos, monto: e.target.value })}
                required
            />
            <Input label="Nro. de factura (opcional)" name="nroFactura" type="text"
                value={datos.nroFactura}
                onChange={(e) => setDatos({ ...datos, nroFactura: e.target.value })}
            />
            <textarea
                className="w-full resize-none p-2 border rounded-md"
                rows={4}
                placeholder="Descripción (opcional)"
                value={datos.descripcion}
                onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <Btn type="submit">{registro ? "Guardar Cambios" : "Registrar Gasto"}</Btn>
                <Btn type="button" variant="ghost" onClick={onCancel}>Cancelar</Btn>
            </div>
        </Formulario>
    )
};
export default GastosForm;
