import Btn from "../../../ui/componentes/Btn";
import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import CrearFuenteIngresoModal from "../modales/CrearFuenteIngresoModal";
import EditarFuenteIngresoModal from "../modales/EditarFuenteIngresoModal";
import FiltroFuentesIngreso, {
    aplicarFiltrosFuentesIngreso,
    filtrosFuentesIngresoVacios,
    type FiltrosFuentesIngreso,
} from "../componentes/FiltroFuentesIngreso";
import { columnasFuentesIngreso } from "../fuentesIngreso.columns";
import { useState, useEffect, useMemo } from "react";
import {
    getFuentesIngreso,
    deleteFuenteIngreso,
    type FuenteIngreso,
} from "../../../services/fuentesIngresoService";
import { getRubros, type Rubro } from "../../../services/rubrosService";

type ModalFuentes = "crearFuente" | "editarFuente" | "eliminarFuente" | null;

const FuentesIngresoPage = () => {
    const [fuentes, setFuentes] = useState<FuenteIngreso[]>([]);
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [fuenteSeleccionada, setFuenteSeleccionada] = useState<FuenteIngreso | null>(null);
    const [activarModal, setActivarModal] = useState<ModalFuentes>(null);
    const [filtros, setFiltros] = useState<FiltrosFuentesIngreso>(filtrosFuentesIngresoVacios);
    const [error, setError] = useState("");

    const cargarFuentes = () => {
        return getFuentesIngreso()
            .then((response) => {
                setFuentes(response);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar las fuentes de ingreso"));
    };

    useEffect(() => {
        cargarFuentes();
    }, []);

    useEffect(() => {
        getRubros()
            .then(setRubros)
            .catch(() => setError("No se pudieron cargar los rubros"));
    }, []);

    // Una fuente le paga al evento: solo tienen sentido los rubros de Ingreso o Mixto
    const rubrosIngreso = useMemo(() => rubros.filter((rubro) => rubro.tipo !== "Gasto"), [rubros]);

    const fuentesFiltradas = useMemo(
        () => aplicarFiltrosFuentesIngreso(fuentes, filtros),
        [fuentes, filtros],
    );

    return (
        <main className="gap-6 px-8">
            <ContenedorDatos>
                <Header
                    titulo="Gestión de Fuentes de Ingreso"
                    action={<Btn onClick={() => setActivarModal("crearFuente")}>+ Agregar Fuente</Btn>}
                />

                {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

                <div className="px-6 pt-4">
                    <FiltroFuentesIngreso rubros={rubrosIngreso} filtros={filtros} onChange={setFiltros} />
                </div>

                <GenericTable<FuenteIngreso>
                    columns={columnasFuentesIngreso}
                    data={fuentesFiltradas}
                    actions={(row) => (
                        <div className="grid grid-cols-2 gap-2">
                            <Btn
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setFuenteSeleccionada(row);
                                    setActivarModal("editarFuente");
                                }}
                            >
                                Editar
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                    setFuenteSeleccionada(row);
                                    setActivarModal("eliminarFuente");
                                }}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>

            <CrearFuenteIngresoModal
                isOpen={activarModal === "crearFuente"}
                rubros={rubrosIngreso}
                closeModal={() => setActivarModal(null)}
                onCreated={() => {
                    cargarFuentes();
                    setActivarModal(null);
                }}
            />

            <EditarFuenteIngresoModal
                isOpen={activarModal === "editarFuente"}
                fuente={fuenteSeleccionada}
                rubros={rubrosIngreso}
                closeModal={() => setActivarModal(null)}
                onUpdated={() => {
                    cargarFuentes();
                    setActivarModal(null);
                }}
            />

            <ConfirmarAccion
                isOpen={activarModal === "eliminarFuente"}
                title="Eliminar fuente de ingreso"
                mensaje="Desea confirmar la eliminación de la fuente de ingreso"
                entidad={fuenteSeleccionada?.nombre || ""}
                onConfirmar={async () => {
                    if (!fuenteSeleccionada) return;
                    await deleteFuenteIngreso(fuenteSeleccionada.id);
                    await cargarFuentes();
                    setActivarModal(null);
                }}
                onCancelar={() => setActivarModal(null)}
            />
        </main>
    );
};

export default FuentesIngresoPage;
