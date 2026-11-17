import Btn from "../../../ui/componentes/Btn";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import { CalendarDays } from "lucide-react";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import PuntoVentaModal from "../modales/PuntoVentaModal";
import FiltroPuntosVenta, {
    aplicarFiltrosPuntosVenta,
    filtrosPuntosVentaVacios,
    type FiltrosPuntosVenta,
} from "../componentes/FiltroPuntosVenta";
import { columnasPuntosVenta } from "../puntosVenta.columns";
import { useState, useEffect, useMemo } from "react";
import { getPuntosVenta, deletePuntoVenta, type PuntoVenta } from "../../../services/puntosVentaService";

type ModalPuntosVenta = "guardar" | "eliminar" | null;

const PuntosVentaPage = () => {
    const [puntos, setPuntos] = useState<PuntoVenta[]>([]);
    // undefined = el modal de guardar crea uno nuevo
    const [seleccionado, setSeleccionado] = useState<PuntoVenta | undefined>(undefined);
    const [activarModal, setActivarModal] = useState<ModalPuntosVenta>(null);
    const [filtros, setFiltros] = useState<FiltrosPuntosVenta>(filtrosPuntosVentaVacios);
    const [error, setError] = useState("");

    const cargarPuntos = () => {
        return getPuntosVenta()
            .then((response) => {
                setPuntos(response);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar los puntos de venta"));
    };

    useEffect(() => {
        cargarPuntos();
    }, []);

    const puntosFiltrados = useMemo(() => aplicarFiltrosPuntosVenta(puntos, filtros), [puntos, filtros]);

    const abrir = (modal: ModalPuntosVenta, punto?: PuntoVenta) => {
        setSeleccionado(punto);
        setActivarModal(modal);
    };

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                icono={<CalendarDays />}
                seccion="Eventos"
                titulo="Puntos de venta"
                acciones={<Btn onClick={() => abrir("guardar")}>+ Agregar Punto de Venta</Btn>}
            />
            <ContenedorDatos>

                {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

                <div className="px-6 pt-4">
                    <FiltroPuntosVenta filtros={filtros} onChange={setFiltros} />
                </div>

                <GenericTable<PuntoVenta>
                    columns={columnasPuntosVenta}
                    data={puntosFiltrados}
                    actions={(row) => (
                        <div className="grid grid-cols-2 gap-2">
                            <Btn size="sm" variant="outline" onClick={() => abrir("guardar", row)}>
                                Editar
                            </Btn>
                            <Btn size="sm" variant="danger" onClick={() => abrir("eliminar", row)}>
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>

            {/* ── MODALES ──────────────────────────────────────────────────── */}

            <PuntoVentaModal
                isOpen={activarModal === "guardar"}
                puntoVenta={seleccionado}
                closeModal={() => setActivarModal(null)}
                onSaved={() => {
                    cargarPuntos();
                    setActivarModal(null);
                }}
            />

            {/* Se monta solo mientras está abierta: así no arrastra el error de la vez anterior */}
            {activarModal === "eliminar" && seleccionado && (
                <ConfirmarAccion
                    isOpen
                    title="Eliminar punto de venta"
                    mensaje="Desea confirmar la eliminación del punto de venta"
                    entidad={seleccionado.nombre}
                    onConfirmar={async () => {
                        await deletePuntoVenta(seleccionado.id);
                        await cargarPuntos();
                        setActivarModal(null);
                    }}
                    onCancelar={() => setActivarModal(null)}
                />
            )}
        </main>
    );
};

export default PuntosVentaPage;
