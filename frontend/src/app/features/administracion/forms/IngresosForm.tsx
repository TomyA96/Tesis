import Formulario from "../../../ui/componentes/Formulario"
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { useState } from "react";
import type { Rubro } from "../../../services/rubrosService";
import type { FuenteIngreso } from "../../../services/fuentesIngresoService";
import { createIngreso, updateIngreso, type IngresoEvento } from "../../../services/movimientoFinancieroService";

// Todo viaja como string mientras vive en el formulario; se convierte al enviar.
export type IngresoFormData = {
    idRubro: string;
    idFuente: string;
    nroFactura: string;
    fecha: string;
    monto: string;
    descripcion: string;
};

type IngresosFormProps = {
    idEvento: number;
    rubros: Rubro[];
    fuentes: FuenteIngreso[];
    // Si viene, el formulario edita ese ingreso en vez de crear uno nuevo
    registro?: IngresoEvento;
    onSaved: () => void;
    onCancel: () => void;
};

const ingresoAFormulario = (registro?: IngresoEvento): IngresoFormData => ({
    idRubro: registro ? String(registro.idRubro) : "",
    // Los ingresos viejos pueden no tener fuente: queda vacío y el required obliga a elegir una
    idFuente: registro?.idFuente ? String(registro.idFuente) : "",
    nroFactura: registro?.nroFactura ?? "",
    // La API manda ISO completo; el input date necesita solo "YYYY-MM-DD"
    fecha: registro ? registro.fecha.split("T")[0] : "",
    monto: registro?.monto ?? "",
    descripcion: registro?.descripcion ?? "",
});

const IngresosForm = ({ idEvento, rubros, fuentes, registro, onSaved, onCancel }: IngresosFormProps) => {
    const [datos, setDatos] = useState<IngresoFormData>(ingresoAFormulario(registro));
    const [error, setError] = useState("");

    // Un ingreso solo puede ir a un rubro de tipo Ingreso o Mixto (el rubro actual del registro siempre se muestra)
    const opcionesRubros = [
        { label: "Seleccione un rubro", value: "", disabled: true },
        ...rubros
            .filter((rubro) => rubro.tipo !== "Gasto" || rubro.id === registro?.idRubro)
            .map((rubro) => ({ label: rubro.nombre, value: rubro.id })),
    ];

    /*
        Fuentes activas asociadas al rubro elegido. Al editar, la fuente que ya tenía el
        ingreso se sigue mostrando aunque hoy esté bloqueada: mientras no cambie rubro ni
        fuente, el backend tampoco la vuelve a validar.
    */
    const fuentesDelRubro = fuentes
        .filter((fuente) => {
            const esLaActual =
                fuente.id === registro?.idFuente && Number(datos.idRubro) === registro?.idRubro;
            const disponible =
                fuente.estado === "Activo" &&
                fuente.rubros.some((rubro) => rubro.id === Number(datos.idRubro));
            return esLaActual || disponible;
        })
        .map((fuente) => ({ label: fuente.nombre, value: fuente.id }));

    const textoPlaceholderFuente =
        datos.idRubro === "" ? "Primero elegí un rubro"
        : fuentesDelRubro.length === 0 ? "No hay fuentes activas para este rubro"
        : "Seleccione una fuente";

    const opcionesFuentes = [
        { label: textoPlaceholderFuente, value: "", disabled: true },
        ...fuentesDelRubro,
    ];

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (registro) {
                // null borra factura/descripción si se vaciaron
                await updateIngreso(registro.id, {
                    idRubro: Number(datos.idRubro),
                    idFuente: Number(datos.idFuente),
                    nroFactura: datos.nroFactura.trim() || null,
                    fecha: new Date(datos.fecha),
                    monto: parseFloat(datos.monto),
                    descripcion: datos.descripcion.trim() || null,
                });
            } else {
                await createIngreso({
                    idEvento,
                    idRubro: Number(datos.idRubro),
                    idFuente: Number(datos.idFuente),
                    nroFactura: datos.nroFactura.trim() || undefined,
                    fecha: new Date(datos.fecha),
                    monto: parseFloat(datos.monto),
                    descripcion: datos.descripcion.trim() || undefined,
                });
            }
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al guardar el ingreso");
        }
    };

    return (
        <Formulario className="min-w-[400px]" onSubmit={onSubmit}>
            <Select label="Rubro" name="idRubro"
                opciones={opcionesRubros}
                value={datos.idRubro}
                // Cambiar de rubro invalida la fuente elegida: puede no estar asociada al nuevo
                onChange={(e) => setDatos({ ...datos, idRubro: e.target.value, idFuente: "" })}
                required
            />
            <Select label="Fuente del ingreso" name="idFuente"
                opciones={opcionesFuentes}
                value={datos.idFuente}
                onChange={(e) => setDatos({ ...datos, idFuente: e.target.value })}
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
                <Btn type="submit">{registro ? "Guardar Cambios" : "Registrar Ingreso"}</Btn>
                <Btn type="button" variant="ghost" onClick={onCancel}>Cancelar</Btn>
            </div>
        </Formulario>
    )
};
export default IngresosForm;
