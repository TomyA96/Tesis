import Btn from "../../../ui/componentes/Btn";
import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import CrearProveedorModal from "../modales/CrearProveedorModal";
import EditarProveedorModal from "../modales/EditarProveedorModal";
import FiltroProveedores, {
    aplicarFiltrosProveedores,
    filtrosProveedoresVacios,
    type FiltrosProveedores,
} from "../componentes/FiltroProveedores";
import { columnasProveedores } from "../proveedores.columns";
import { useState, useEffect, useMemo } from "react";
import { getProveedores, deleteProveedor, type Proveedor } from "../../../services/proveedoresService";
import { getRubros, type Rubro } from "../../../services/rubrosService";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type ModalProveedores = "crearProveedor" | "editarProveedor" | "eliminarProveedor" | null;

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const Proveedores = () => {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    /*
        Los rubros se cargan una sola vez acá y se pasan hacia abajo: los usan el
        filtro de la tabla y el selector de los dos formularios. Así no repetimos
        el pedido en cada modal.
    */
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
    const [activarModal, setActivarModal] = useState<ModalProveedores>(null);
    const [filtros, setFiltros] = useState<FiltrosProveedores>(filtrosProveedoresVacios);
    const [error, setError] = useState("");

    const cargarProveedores = () => {
        return getProveedores()
            .then((response) => {
                setProveedores(response);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar los proveedores"));
    };

    useEffect(() => {
        cargarProveedores();
    }, []);

    useEffect(() => {
        getRubros()
            .then(setRubros)
            .catch(() => setError("No se pudieron cargar los rubros"));
    }, []);

    const proveedoresFiltrados = useMemo(
        () => aplicarFiltrosProveedores(proveedores, filtros),
        [proveedores, filtros],
    );

    return (
        <main className="gap-6 px-8">
            <ContenedorDatos>
                <Header
                    titulo="Gestión de Proveedores"
                    action={<Btn onClick={() => setActivarModal("crearProveedor")}>+ Agregar Proveedor</Btn>}
                />

                {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

                <div className="px-6 pt-4">
                    <FiltroProveedores rubros={rubros} filtros={filtros} onChange={setFiltros} />
                </div>

                <GenericTable<Proveedor>
                    columns={columnasProveedores}
                    data={proveedoresFiltrados}
                    actions={(row) => (
                        <div className="grid grid-cols-2 gap-2">
                            <Btn
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setProveedorSeleccionado(row);
                                    setActivarModal("editarProveedor");
                                }}
                            >
                                Editar
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                    setProveedorSeleccionado(row);
                                    setActivarModal("eliminarProveedor");
                                }}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>

            {/* ── MODALES ──────────────────────────────────────────────────── */}

            <CrearProveedorModal
                isOpen={activarModal === "crearProveedor"}
                rubros={rubros}
                closeModal={() => setActivarModal(null)}
                onCreated={() => {
                    cargarProveedores();
                    setActivarModal(null);
                }}
            />

            <EditarProveedorModal
                isOpen={activarModal === "editarProveedor"}
                proveedor={proveedorSeleccionado}
                rubros={rubros}
                closeModal={() => setActivarModal(null)}
                onUpdated={() => {
                    cargarProveedores();
                    setActivarModal(null);
                }}
            />

            <ConfirmarAccion
                isOpen={activarModal === "eliminarProveedor"}
                title="Eliminar proveedor"
                mensaje="Desea confirmar la eliminación del proveedor"
                entidad={proveedorSeleccionado?.nombre || ""}
                onConfirmar={async () => {
                    if (!proveedorSeleccionado) return;
                    await deleteProveedor(proveedorSeleccionado.id);
                    await cargarProveedores();
                    setActivarModal(null);
                }}
                onCancelar={() => setActivarModal(null)}
            />
        </main>
    );
};

export default Proveedores;
