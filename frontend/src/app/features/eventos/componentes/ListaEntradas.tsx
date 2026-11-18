import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import LoteEntrada from "./LoteEntrada";
import EntradaModal from "../modales/EntradaModal";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    anularEntrada,
    deleteEntrada,
    deshabilitarEntrada,
    habilitarEntrada,
    imprimirEntrada,
    publicarEntrada,
    type Entrada,
} from "../../../services/entradasService";
import type { EstadoEvento } from "../../../services/eventosService";
import { accionesDeEntradas, type AccionEntrada } from "../utils/accionesParaEntradas";
import { RUTAS } from "../../../constantes/Rutas";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { formatPrecio } from "../../../utils/formatoPrecio";

// Las acciones que no tienen vuelta atrás pasan por una confirmación
type AccionConfirmable = "publicar" | "imprimir" | "anular";

type ListarEntradasProps = {
    entradas: Entrada[],
    // Estado de la JORNADA dueña de las entradas (usa los mismos valores que el del evento)
    estadoEvento: EstadoEvento,
    // idEvento solo se usa para los links a Ventas y Tickets; las entradas se crean en la jornada
    idEvento: number,
    idJornada: number,
    capacidad: number;
    onEntradaGuardada: () => void | Promise<void>;
}

/*
    Lugares de la jornada que ya tienen dueño: un lote en Borrador reserva
    su cantidad; uno publicado o impreso, sus tickets que no se anularon; la
    boletería, lo que vendió en la puerta. Es la misma cuenta que hace el
    backend para no pasarse de la capacidad.
*/
const lugaresAsignados = (entradas: Entrada[]) =>
    entradas.reduce(
        (suma, e) => suma + (e.esBoleteria ? e.vendidos : e.estado === "Borrador" ? e.cantidad : e.cantidad - e.anulados),
        0,
    );

const ListaEntradas = ({ entradas: todas, idEvento, idJornada, estadoEvento, capacidad, onEntradaGuardada }: ListarEntradasProps) => {
    // La boletería no se maneja como un lote: se configura desde el evento y se muestra aparte
    const boleteria = todas.find((e) => e.esBoleteria);
    const entradas = todas.filter((e) => !e.esBoleteria);
    const [modalAbierto, setModalAbierto] = useState(false);
    // La que se está editando (undefined = crear una nueva)
    const [entradaSeleccionada, setEntradaSeleccionada] = useState<Entrada | undefined>(undefined);
    const [confirmacion, setConfirmacion] = useState<{ accion: AccionConfirmable; lote: Entrada } | null>(null);
    // Error de una acción directa (sin confirmación): se muestra arriba de la lista
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const ejecutar = async (accion: () => Promise<unknown>) => {
        setError("");
        try {
            await accion();
            await onEntradaGuardada();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo completar la acción");
        }
    };

    const onAccion = (lote: Entrada, accion: AccionEntrada) => {
        switch (accion) {
            case "editar":
                setEntradaSeleccionada(lote);
                setModalAbierto(true);
                return;
            // Un lote en Borrador no tiene tickets ni ventas: se borra sin preguntar
            case "eliminar":
                return ejecutar(() => deleteEntrada(lote.id));
            case "habilitar":
                return ejecutar(() => habilitarEntrada(lote.id));
            case "deshabilitar":
                return ejecutar(() => deshabilitarEntrada(lote.id));
            // Los tickets físicos se entregan, corrigen y anulan en la pantalla de tickets del evento
            case "tickets":
                navigate(RUTAS.eventos.tickets(idEvento, { lote: lote.id }));
                return;
            case "publicar":
            case "imprimir":
            case "anular":
                setConfirmacion({ accion, lote });
                return;
        }
    };

    // "su único ticket" / "sus 4 tickets"
    const susTickets = (lote: Entrada) => (lote.cantidad === 1 ? "su único ticket" : `sus ${lote.cantidad} tickets`);

    // ConfirmarAccion envuelve el mensaje en "¿...?"
    const confirmaciones: Record<AccionConfirmable, { titulo: string; mensaje: (lote: Entrada) => string; ejecutar: (lote: Entrada) => Promise<unknown> }> = {
        publicar: {
            titulo: "Publicar lote",
            mensaje: (lote) => `Publicar «${lote.descripcion}» (se crea${lote.cantidad === 1 ? "" : "n"} ${susTickets(lote)}, a la venta online; después ya no se pueden cambiar la cantidad ni el precio)`,
            ejecutar: (lote) => publicarEntrada(lote.id),
        },
        imprimir: {
            titulo: "Imprimir lote",
            mensaje: (lote) => `Imprimir «${lote.descripcion}» (se crea${lote.cantidad === 1 ? "" : "n"} ${susTickets(lote)} y se descarga el PDF; no se puede volver a imprimir)`,
            ejecutar: (lote) => imprimirEntrada(lote.id, lote.descripcion),
        },
        // Solo lotes online: los físicos se anulan desde la pantalla de tickets
        anular: {
            titulo: "Anular lote",
            mensaje: (lote) => `Anular «${lote.descripcion}» (sus tickets sin vender quedan anulados y liberan su lugar; los vendidos siguen valiendo; no se puede deshacer)`,
            ejecutar: (lote) => anularEntrada(lote.id),
        },
    };

    const sePuedeCrear = estadoEvento !== "Finalizado" && estadoEvento !== "Cancelado";

    return (
        <>
            <ContenedorDatos>
                <Header
                    titulo="Lista de Entradas"
                    action={
                        <div className="flex gap-2">
                            {sePuedeCrear && (
                                <Btn size="sm" onClick={() => {
                                    setEntradaSeleccionada(undefined);
                                    setModalAbierto(true);
                                }}>
                                    + Crear Entrada
                                </Btn>
                            )}
                            {estadoEvento !== "Borrador" &&
                                <LinkBtn to={RUTAS.eventos.ventas(Number(idEvento))} variant="outline" size="sm" className="min-w-[110px]">Ver Ventas</LinkBtn>
                            }
                        </div>
                    }
                />

                <p className="px-6 text-sm text-gray-500">
                    Lugares asignados: <strong className="text-gray-800">{lugaresAsignados(todas)}</strong> de {capacidad}
                </p>
                <p className="px-6 pt-1 text-sm text-gray-500">
                    Boletería:{" "}
                    {boleteria ? (
                        <>
                            <strong className="text-gray-800">General Boletería</strong> a {formatPrecio(Number(boleteria.precio))} ·{" "}
                            {boleteria.vendidos} vendidas en la puerta{!boleteria.habilitada && " · pausada"}
                        </>
                    ) : (
                        "sin configurar (se configura desde la pantalla del evento)"
                    )}
                </p>

                {error && <p role="alert" className="px-6 pt-2 text-sm text-red-600">{error}</p>}

                {/* ── LISTA DE LOTES ─────────────────────────────────────────── */}
                {entradas.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                        No hay entradas configuradas para esta jornada
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-6 pt-3">
                        {entradas.map((lote) => (
                            <LoteEntrada
                                key={lote.id}
                                entrada={lote}
                                acciones={accionesDeEntradas(estadoEvento, lote)}
                                onAccion={(accion) => onAccion(lote, accion)}
                            />
                        ))}
                    </div>
                )}
            </ContenedorDatos>

            <EntradaModal
                isOpen={modalAbierto}
                closeModal={() => setModalAbierto(false)}
                entrada={entradaSeleccionada}
                idJornada={idJornada}
                onSaved={async () => {
                    setModalAbierto(false);
                    await onEntradaGuardada();
                }}
            />

            {/* Se monta solo mientras hay algo para confirmar: así no arrastra el error de la vez anterior */}
            {confirmacion && (
                <ConfirmarAccion
                    isOpen
                    title={confirmaciones[confirmacion.accion].titulo}
                    mensaje={confirmaciones[confirmacion.accion].mensaje(confirmacion.lote)}
                    variante={confirmacion.accion === "anular" ? "danger" : "primary"}
                    onConfirmar={async () => {
                        await confirmaciones[confirmacion.accion].ejecutar(confirmacion.lote);
                        setConfirmacion(null);
                        await onEntradaGuardada();
                    }}
                    onCancelar={() => setConfirmacion(null)}
                />
            )}
        </>
    );
};

export default ListaEntradas;
