import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import SelectorRubros from "../componentes/SelectorRubros";
import { useState, type FormEvent } from "react";
import { createFuenteIngreso } from "../../../services/fuentesIngresoService";
import type { Rubro } from "../../../services/rubrosService";

type CrearFuenteIngresoFormProps = {
    // Llegan ya filtrados a Ingreso y Mixto desde la página
    rubros: Rubro[];
    onCancel: () => void;
    onCreated: () => void;
};

const CrearFuenteIngresoForm = ({ rubros, onCancel, onCreated }: CrearFuenteIngresoFormProps) => {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [rubrosSeleccionados, setRubrosSeleccionados] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

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

        setGuardando(true);
        try {
            await createFuenteIngreso({
                nombre: nombre.trim(),
                email: email.trim() || undefined,
                telefono: telefono.trim() || undefined,
                idsRubros: rubrosSeleccionados,
            });
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear la fuente de ingreso");
        } finally {
            setGuardando(false);
        }
    };

    if (rubros.length === 0) {
        return (
            <div className="w-[40rem] max-w-[calc(100vw-4rem)] px-6 py-10 text-center">
                <p className="text-base font-semibold text-red-600">Todavía no hay rubros de ingreso cargados</p>
                <p className="mt-1 text-sm text-gray-500">
                    Una fuente de ingreso tiene que pertenecer al menos a un rubro de tipo Ingreso o Mixto.
                    Creá primero un rubro desde Administración → Rubros.
                </p>
                <Btn variant="cancel" type="button" className="mt-6" onClick={onCancel}>
                    Cerrar
                </Btn>
            </div>
        );
    }

    return (
        <Formulario className="w-[40rem] max-w-[calc(100vw-4rem)] gap-5" onSubmit={onSubmit}>
            <Input
                label="Nombre de la fuente"
                name="nombre"
                type="text"
                placeholder="Ej: Municipalidad de Cañuelas, Coca-Cola, Puesto de artesanías"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Email (opcional)"
                    name="email"
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    label="Teléfono (opcional)"
                    name="telefono"
                    type="text"
                    placeholder="3564 123456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
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
                    {guardando ? "Creando..." : "Crear Fuente"}
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default CrearFuenteIngresoForm;
