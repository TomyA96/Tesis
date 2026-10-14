import Btn from "../../../ui/componentes/Btn";
import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import CrearRubroModal from "../modales/CrearRubroModal";
import EditarRubroModal from "../modales/EditarRubroModal";
import FiltroRubros, {
    aplicarFiltrosRubros,
    filtrosRubrosVacios,
    type FiltrosRubros,
} from "../componentes/FiltroRubros";
import { columnasRubros } from "../rubros.columns";
import { useState, useEffect, useMemo } from "react";
import { getRubros, deleteRubro, type Rubro } from "../../../services/rubrosService";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type ModalRubros = "crearRubro" | "editarRubro" | "eliminarRubro" | null;

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const Rubros = () => {
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [rubroSeleccionado, setRubroSeleccionado] = useState<Rubro | null>(null);
    const [activarModal, setActivarModal] = useState<ModalRubros>(null);
    const [filtros, setFiltros] = useState<FiltrosRubros>(filtrosRubrosVacios);
    const [error, setError] = useState("");

    /*
        Una sola función para traer los rubros: la usa el useEffect del primer
        render y también cada modal después de crear, editar o eliminar.
    */
    const cargarRubros = () => {
        return getRubros()
            .then((response) => {
                setRubros(response);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar los rubros"));
    };

    useEffect(() => {
        cargarRubros();
    }, []);

    /*
        El filtrado es en memoria sobre la lista ya traída. useMemo evita
        recalcularlo en cada render: solo se rehace si cambian los rubros o los
        filtros.
    */
    const rubrosFiltrados = useMemo(() => aplicarFiltrosRubros(rubros, filtros), [rubros, filtros]);

    return (
        <main className="gap-6 px-8">
            <ContenedorDatos>
                <Header
                    titulo="Gestión de Rubros"
                    action={<Btn onClick={() => setActivarModal("crearRubro")}>+ Crear Rubro</Btn>}
                />

                {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

                <div className="px-6 pt-4">
                    <FiltroRubros filtros={filtros} onChange={setFiltros} />
                </div>

                <GenericTable<Rubro>
                    columns={columnasRubros}
                    data={rubrosFiltrados}
                    actions={(row) => (
                        <div className="grid grid-cols-2 gap-2">
                            <Btn
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setRubroSeleccionado(row);
                                    setActivarModal("editarRubro");
                                }}
                            >
                                Editar
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                    setRubroSeleccionado(row);
                                    setActivarModal("eliminarRubro");
                                }}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>

            {/* ── MODALES ──────────────────────────────────────────────────── */}

            <CrearRubroModal
                isOpen={activarModal === "crearRubro"}
                closeModal={() => setActivarModal(null)}
                onCreated={() => {
                    cargarRubros();
                    setActivarModal(null);
                }}
            />

            <EditarRubroModal
                isOpen={activarModal === "editarRubro"}
                rubro={rubroSeleccionado}
                closeModal={() => setActivarModal(null)}
                onUpdated={() => {
                    cargarRubros();
                    setActivarModal(null);
                }}
            />

            {/*
                Si el backend rechaza el borrado (el rubro tiene movimientos o
                proveedores), ConfirmarAccion atrapa el error y lo muestra sin
                cerrarse: el await de acá abajo nunca llega a setActivarModal.
            */}
            <ConfirmarAccion
                isOpen={activarModal === "eliminarRubro"}
                title="Eliminar rubro"
                mensaje="Desea confirmar la eliminación del rubro"
                entidad={rubroSeleccionado?.nombre || ""}
                onConfirmar={async () => {
                    if (!rubroSeleccionado) return;
                    await deleteRubro(rubroSeleccionado.id);
                    await cargarRubros();
                    setActivarModal(null);
                }}
                onCancelar={() => setActivarModal(null)}
            />
        </main>
    );
};

export default Rubros;
