import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import LoteEntrada from "./LoteEntrada";
import EntradaModal from "../modales/EntradaModal";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { useState } from "react";
import { deleteEntrada, deshabilitarEntrada, habilitarEntrada, imprimirEntrada, publicarEntrada, type Entrada } from "../../../services/entradasService";
import type { EstadoEvento } from "../../../services/eventosService";
import { accionesDeEntradas } from "../utils/accionesParaEntradas";
import { RUTAS } from "../../../constantes/Rutas";
import LinkBtn from "../../../ui/componentes/LinkBtn";

// ── TIPO DE MODAL ──────────────────────────────────────────────────────────────
// Mismo patrón que el resto del sistema
type ModalEntradas = "entrada" | null;

type ListarEntradasProps = {
    entradas:Entrada[],
    estadoEvento: EstadoEvento,
    idEvento: number,
    capacidad: number;
    onEntradaGuardada: () => void;
}


// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
const ListaEntradas = ({entradas, idEvento, estadoEvento, capacidad, onEntradaGuardada}:ListarEntradasProps) => {
    // Mismo patrón que el resto del sistema
    const [modalActivo, setModalActivo] = useState<ModalEntradas>(null);
    const [entradaSeleccionada, setEntradaSeleccionada] = useState<Entrada | undefined>(undefined)
    // Separado de entradaSeleccionada: esa es "cuál estoy editando" (para el
    // form), esta es "cuál estoy por borrar" (para el diálogo) — son dos
    // flujos distintos, mezclarlos en un solo estado los haría interferir.
    const [entradaAEliminar, setEntradaAEliminar] = useState<Entrada | null>(null)
    // Mismo motivo que entradaAEliminar: imprimir es irreversible y tiene
    // costo real (papel, tickets físicos comprometidos) — necesita su propio
    // diálogo, no alcanza con disparar la acción directo al click.
    const [entradaAImprimir, setEntradaAImprimir] = useState<Entrada | null>(null)

    return (
        <>
            <ContenedorDatos>
                <Header
                    titulo="Lista de Entradas"
                    action={
                        <div className="flex gap-2">
                            {estadoEvento !== "Finalizado" && estadoEvento !== "Cancelado" && (
                                <Btn size="sm" onClick={() => {
                                    setModalActivo("entrada");
                                    setEntradaSeleccionada(undefined);
                                }}>
                                    + Crear Entrada
                                </Btn>
                            )}
                            { estadoEvento !== "Borrador" &&
                                <LinkBtn to={RUTAS.eventos.ventas(Number(idEvento))} variant="outline" size="sm" className="min-w-[110px]">Ver Ventas</LinkBtn>
                            }
                        </div>
                    }
                />

                {/* ── LISTA DE LOTES ─────────────────────────────────────────── */}
                {entradas.length === 0 ? (
                    // Estado vacío — mismo patrón que GenericTable
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                        No hay entradas configuradas para este evento
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-6 pt-2">
                        {entradas.map((lote) => {
                            
                            const acciones = accionesDeEntradas(estadoEvento, lote, lote.cantidadTicket > 0);
                            const onPublicar = () => publicarEntrada(lote.id).then(onEntradaGuardada);
                            const onHabilitar = () => habilitarEntrada(lote.id).then(onEntradaGuardada);
                            const onDeshabilitar = () => deshabilitarEntrada(lote.id).then(onEntradaGuardada);
                            const onImprimir = () => setEntradaAImprimir(lote);
                            const onEliminar = () => {
                                if (lote.estado === "Borrador") {
                                    deleteEntrada(lote.id).then(onEntradaGuardada);
                                } else {
                                    setEntradaAEliminar(lote);
                                }
                            };
                            const onEditar = () => {
                                setEntradaSeleccionada(lote);
                                setModalActivo("entrada");
                            };
                            return(<LoteEntrada key={lote.id}
                                entrada={lote}
                                acciones={acciones}
                                cantidadTotal={capacidad}
                                cantidadVendida={lote.cantidadTicket || 0}
                                onEditar={onEditar}
                                onPublicar={onPublicar}
                                onHabilitar={onHabilitar}
                                onDeshabilitar={onDeshabilitar}
                                onEliminar={onEliminar}
                                onImprimir={onImprimir}
                            />);
                        })}
                    </div>)}
              
            </ContenedorDatos>

                     
            <EntradaModal
                isOpen={modalActivo === "entrada"}
                closeModal={() => setModalActivo(null)}
                entrada={entradaSeleccionada}
                idEvento={Number(idEvento)}
                onSaved={() => {
                    setModalActivo(null)
                    onEntradaGuardada()
                }}
            />

            <ConfirmarAccion
                isOpen={entradaAEliminar !== null}
                title="Eliminar entrada"
                mensaje="Esta acción no se puede deshacer, confirmás que querés eliminar la entrada"
                entidad={entradaAEliminar?.descripcion}
                onConfirmar={async () => {
                    if (!entradaAEliminar) return;
                    await deleteEntrada(entradaAEliminar.id);
                    onEntradaGuardada();
                    setEntradaAEliminar(null);
                }}
                onCancelar={() => setEntradaAEliminar(null)}
            />

            <ConfirmarAccion
                isOpen={entradaAImprimir !== null}
                title="Imprimir entrada"
                mensaje="Esta acción no se puede deshacer una vez que se generan los tickets fisicos. ¿Desea continuar?"
                entidad={""}
                variante="primary"
                onConfirmar={async () => {
                    if (!entradaAImprimir) return;
                    await imprimirEntrada(entradaAImprimir.id);
                    onEntradaGuardada();
                    setEntradaAImprimir(null);
                }}
                onCancelar={() => setEntradaAImprimir(null)}
            />
        </>
    );
};

export default ListaEntradas;