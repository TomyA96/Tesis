import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { useState, type FormEvent } from "react";
import {
    createPuntoVenta,
    updatePuntoVenta,
    opcionesEstadoPuntoVenta,
    type EstadoPuntoVenta,
    type PuntoVenta,
    type UpdatePuntoVenta,
} from "../../../services/puntosVentaService";

type PuntoVentaFormProps = {
    // Sin puntoVenta se crea uno nuevo; con puntoVenta se edita ese
    puntoVenta?: PuntoVenta;
    onCancel: () => void;
    onSaved: () => void;
};

const PuntoVentaForm = ({ puntoVenta, onCancel, onSaved }: PuntoVentaFormProps) => {
    const [nombre, setNombre] = useState(puntoVenta?.nombre ?? "");
    const [telefono, setTelefono] = useState(puntoVenta?.telefono ?? "");
    const [estado, setEstado] = useState<EstadoPuntoVenta>(puntoVenta?.estado ?? "Activo");
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
            if (!puntoVenta) {
                // Si el teléfono quedó vacío no viaja (undefined), en vez de mandar ""
                await createPuntoVenta({ nombre: nombre.trim(), telefono: telefono.trim() || undefined });
            } else {
                // Igual que en proveedores: viaja solo lo que cambió
                const cambios: UpdatePuntoVenta = {};
                if (nombre.trim() !== puntoVenta.nombre) cambios.nombre = nombre.trim();
                if (telefono.trim() !== (puntoVenta.telefono ?? "")) cambios.telefono = telefono.trim() || null;
                if (estado !== puntoVenta.estado) cambios.estado = estado;

                if (Object.keys(cambios).length === 0) {
                    setError("No hiciste ningún cambio");
                    return;
                }
                await updatePuntoVenta(puntoVenta.id, cambios);
            }
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar el punto de venta");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Formulario className="w-[32rem] max-w-[calc(100vw-4rem)] gap-5" noValidate onSubmit={onSubmit}>
            <Input
                label="Nombre del punto de venta"
                name="nombre"
                type="text"
                placeholder="Ej: Quiosco Centro"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <div className={puntoVenta ? "grid grid-cols-2 gap-4" : ""}>
                <Input
                    label="Teléfono (opcional)"
                    name="telefono"
                    type="text"
                    placeholder="3564 123456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />
                {/* Uno nuevo siempre nace activo: el estado solo se cambia al editar */}
                {puntoVenta && (
                    <Select
                        label="Estado"
                        name="estado"
                        opciones={opcionesEstadoPuntoVenta}
                        value={estado}
                        onChange={(e) => setEstado(e.target.value as EstadoPuntoVenta)}
                    />
                )}
            </div>

            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <Btn type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : puntoVenta ? "Guardar Cambios" : "Crear Punto de Venta"}
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default PuntoVentaForm;
