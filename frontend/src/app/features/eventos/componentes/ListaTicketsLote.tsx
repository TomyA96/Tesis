import { useEffect, useMemo, useState } from "react";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import TablaTickets from "./TablaTickets";
import { cn } from "../../../../lib/cn";
import { anularEntrada, type Entrada } from "../../../services/entradasService";
import type { Jornada } from "../../../services/jornadasService";
import type { PuntoVenta } from "../../../services/puntosVentaService";
import {
    ESTADOS_TICKET,
    anularTickets,
    asignarTickets,
    getTicketsDeJornada,
    quitarAsignacionTickets,
    type EstadoTicket,
    type Ticket,
} from "../../../services/ticketsService";
import { accionesPosibles, etiquetaEstadoTicket, tickets as nTickets } from "../utils/tickets";
import { descargarComprobante } from "../../../services/entregasService";

type Confirmacion = "asignar" | "quitar" | "anular" | "anularLote";

// "" = todos los locales; "sin" = los que no están asignados a ninguno
type FiltroLocal = "" | "sin" | number;

type ListaTicketsLoteProps = {
    lote: Entrada;
    jornada: Jornada;
    puntos: PuntoVenta[];
    // Después de cada acción: los conteos del lote cambiaron
    onCambio: () => void | Promise<void>;
};

/*
    Los tickets de UN lote físico, uno por uno, para corregir: pasar
    algunos a otro local, quitarles el local, anular los que se perdieron,
    o anular el lote entero. Lo normal (entregar por cantidad) está en la
    otra vista de la pantalla.
*/
const ListaTicketsLote = ({ lote, jornada, puntos, onCambio }: ListaTicketsLoteProps) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filtroLocal, setFiltroLocal] = useState<FiltroLocal>("");
    const [filtroEstado, setFiltroEstado] = useState<EstadoTicket | "">("");
    const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [localDestino, setLocalDestino] = useState<number | "">("");
    const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");
    // La entrega que se acaba de registrar al asignar: para ofrecer su comprobante
    const [entregaNueva, setEntregaNueva] = useState<{ id: number; puntoVenta: { nombre: string } } | null>(null);

    const terminada = jornada.estado === "Finalizado" || jornada.estado === "Cancelado";

    const cargar = async () => {
        try {
            const deLaJornada = await getTicketsDeJornada(jornada.id);
            setTickets(deLaJornada.filter((t) => t.entrada.id === lote.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar los tickets");
        }
    };

    useEffect(() => {
        setTickets([]);
        setSeleccion(new Set());
        setAviso("");
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lote.id]);

    // Al cambiar lo que se ve, la selección anterior ya no corresponde
    useEffect(() => {
        setSeleccion(new Set());
    }, [filtroLocal, filtroEstado]);

    const delLocal = useMemo(
        () =>
            tickets.filter(
                (t) => filtroLocal === "" || (filtroLocal === "sin" ? t.puntoVenta === null : t.puntoVenta?.id === filtroLocal),
            ),
        [tickets, filtroLocal],
    );
    const visibles = useMemo(
        () => (filtroEstado ? delLocal.filter((t) => t.estado === filtroEstado) : delLocal),
        [delLocal, filtroEstado],
    );
    const cantidadPorEstado = useMemo(() => {
        const cuenta = new Map<EstadoTicket, number>();
        for (const t of delLocal) cuenta.set(t.estado, (cuenta.get(t.estado) ?? 0) + 1);
        return cuenta;
    }, [delLocal]);

    // ── SELECCIÓN ───────────────────────────────────────────────────────────
    const cambiarSeleccion = (ids: number[], seleccionar: boolean) =>
        setSeleccion((prev) => {
            const nueva = new Set(prev);
            ids.forEach((id) => (seleccionar ? nueva.add(id) : nueva.delete(id)));
            return nueva;
        });

    const marcarRango = () => {
        const inicio = Number(desde);
        const fin = Number(hasta);
        if (!Number.isInteger(inicio) || !Number.isInteger(fin) || inicio < 1 || fin < inicio) {
            setError("Ingresá un rango válido: el primer número tiene que ser menor o igual al último");
            return;
        }
        setError("");
        const enRango = visibles.filter((t) => Number(t.numero) >= inicio && Number(t.numero) <= fin);
        cambiarSeleccion(enRango.map((t) => t.id), true);
    };

    const seleccionados = useMemo(() => tickets.filter((t) => seleccion.has(t.id)), [tickets, seleccion]);
    const posibles = accionesPosibles(seleccionados);
    const destino = puntos.find((p) => p.id === localDestino);
    const ids = seleccionados.map((t) => t.id);
    const n = ids.length;
    const yaEnOtroLocal = seleccionados.some((t) => t.puntoVenta && t.puntoVenta.id !== localDestino);

    // ConfirmarAccion envuelve el mensaje en "¿...?"
    const confirmaciones: Record<Confirmacion, { titulo: string; mensaje: string; peligro: boolean; ejecutar: () => Promise<string> }> = {
        asignar: {
            titulo: "Entregar tickets",
            mensaje:
                `Entregar ${nTickets(n)} a «${destino?.nombre}» (se registra una entrega nueva con su comprobante` +
                (yaEnOtroLocal ? "; los que estaban en otro local salen de esa entrega" : "") +
                ")",
            peligro: false,
            ejecutar: async () => {
                const resultado = await asignarTickets(ids, Number(localDestino));
                setEntregaNueva(resultado.entrega);
                return `Se entregaron ${nTickets(resultado.actualizados)} a ${resultado.entrega.puntoVenta.nombre}` +
                    (resultado.yaEstaban > 0 ? ` (${resultado.yaEstaban} ya estaban ahí)` : "");
            },
        },
        quitar: {
            titulo: "Quitar asignación",
            mensaje: `Quitar la asignación de ${nTickets(n)} (vuelven a estar en mano y salen de su entrega, que queda corregida)`,
            peligro: false,
            ejecutar: async () => {
                await quitarAsignacionTickets(ids);
                return `${nTickets(n)} volvieron a estar en mano`;
            },
        },
        anular: {
            titulo: "Anular tickets",
            mensaje: `Anular ${nTickets(n)} (dejan de valer y liberan su lugar en la jornada; no se puede deshacer)`,
            peligro: true,
            ejecutar: async () => {
                await anularTickets(ids);
                return `Se anularon ${nTickets(n)}`;
            },
        },
        anularLote: {
            titulo: "Anular lote",
            mensaje: `Anular «${lote.descripcion}» (sus tickets en mano dejan de valer y liberan su lugar en la jornada; no se puede deshacer)`,
            peligro: true,
            ejecutar: async () => {
                await anularEntrada(lote.id);
                return `Se anuló el lote ${lote.descripcion}`;
            },
        },
    };

    const confirmar = async () => {
        if (!confirmacion) return;
        setEntregaNueva(null);
        const mensaje = await confirmaciones[confirmacion].ejecutar();
        setConfirmacion(null);
        await cargar();
        await onCambio();
        setSeleccion(new Set());
        setAviso(mensaje);
    };

    return (
        <div className="flex flex-col">
            {/* ── RESUMEN POR ESTADO: cada uno filtra la tabla ─────────────── */}
            <div className="flex flex-wrap items-end gap-4 px-6 pt-5">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
                    <BotonEstado activo={filtroEstado === ""} onClick={() => setFiltroEstado("")}>
                        Todos <strong>{delLocal.length}</strong>
                    </BotonEstado>
                    {ESTADOS_TICKET.filter((estado) => cantidadPorEstado.has(estado)).map((estado) => (
                        <BotonEstado key={estado} activo={filtroEstado === estado} onClick={() => setFiltroEstado(filtroEstado === estado ? "" : estado)}>
                            {etiquetaEstadoTicket[estado].texto} <strong>{cantidadPorEstado.get(estado)}</strong>
                        </BotonEstado>
                    ))}
                </div>
                <Select
                    label="Punto de venta"
                    name="filtroLocal"
                    className="min-w-[180px]"
                    opciones={[
                        { label: "Todos", value: "" },
                        { label: "Sin asignar", value: "sin" },
                        ...puntos.map((p) => ({ label: p.nombre, value: p.id })),
                    ]}
                    value={filtroLocal}
                    onChange={(e) => {
                        const valor = e.target.value;
                        setFiltroLocal(valor === "" || valor === "sin" ? valor : Number(valor));
                    }}
                />
                {lote.estado === "Disponible" && !terminada && (
                    <Btn variant="danger" size="sm" className="ml-auto mb-1" onClick={() => setConfirmacion("anularLote")}>
                        Anular lote
                    </Btn>
                )}
            </div>

            {terminada ? (
                <p className="px-6 pt-4 text-sm text-gray-500">
                    La jornada está {jornada.estado.toLowerCase()}: sus tickets solo se pueden consultar.
                </p>
            ) : (
                /* ── SELECCIÓN Y ACCIONES ─────────────────────────────────── */
                <div className="mx-6 mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-end gap-2">
                        <Input label="Del Nº" name="desde" type="number" min={1} className="w-24 bg-white" value={desde} onChange={(e) => setDesde(e.target.value)} />
                        <Input label="al Nº" name="hasta" type="number" min={1} className="w-24 bg-white" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                        <Btn variant="outline" size="sm" className="mb-1" disabled={!desde || !hasta} onClick={marcarRango}>
                            Marcar rango
                        </Btn>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <Select
                            label="Entregar a"
                            name="localDestino"
                            className="min-w-[180px]"
                            opciones={[
                                { label: "Elegí un local", value: "" },
                                ...puntos.filter((p) => p.estado === "Activo").map((p) => ({ label: p.nombre, value: p.id })),
                            ]}
                            value={localDestino}
                            onChange={(e) => setLocalDestino(e.target.value ? Number(e.target.value) : "")}
                        />
                        <Btn
                            size="sm"
                            className="mb-1"
                            disabled={!posibles.asignar || localDestino === ""}
                            title={n > 0 && !posibles.asignar ? "Solo se asignan tickets en mano o ya asignados" : undefined}
                            onClick={() => setConfirmacion("asignar")}
                        >
                            Entregar
                        </Btn>
                        <Btn
                            variant="outline"
                            size="sm"
                            className="mb-1"
                            disabled={!posibles.quitar}
                            title={n > 0 && !posibles.quitar ? "Todos los elegidos tienen que estar asignados" : undefined}
                            onClick={() => setConfirmacion("quitar")}
                        >
                            Quitar asignación
                        </Btn>
                        <Btn
                            variant="danger"
                            size="sm"
                            className="mb-1"
                            disabled={!posibles.anular}
                            title={n > 0 && !posibles.anular ? "Solo se anulan tickets en mano (a un asignado primero quitale la asignación)" : undefined}
                            onClick={() => setConfirmacion("anular")}
                        >
                            Anular
                        </Btn>
                    </div>

                    <div className="ml-auto flex items-center gap-3 pb-1.5 text-sm text-gray-600">
                        <span>
                            Seleccionados: <strong className="text-gray-900">{n}</strong>
                        </span>
                        {n > 0 && (
                            <button type="button" className="cursor-pointer text-blue-600 hover:underline" onClick={() => setSeleccion(new Set())}>
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {error && <p role="alert" className="px-6 pt-3 text-sm text-red-600">{error}</p>}
            {aviso && (
                <p role="status" className="flex flex-wrap items-center gap-3 px-6 pt-3 text-sm text-emerald-700">
                    {aviso}
                    {entregaNueva && (
                        <Btn size="sm" variant="outline" onClick={() => descargarComprobante(entregaNueva.id, entregaNueva.puntoVenta.nombre)}>
                            Descargar comprobante
                        </Btn>
                    )}
                </p>
            )}

            <div className="pt-4">
                <TablaTickets tickets={visibles} seleccionados={seleccion} seleccionable={!terminada} onCambiarSeleccion={cambiarSeleccion} />
            </div>

            {/* Se monta solo mientras hay algo para confirmar: así no arrastra el error de la vez anterior */}
            {confirmacion && (
                <ConfirmarAccion
                    isOpen
                    title={confirmaciones[confirmacion].titulo}
                    mensaje={confirmaciones[confirmacion].mensaje}
                    variante={confirmaciones[confirmacion].peligro ? "danger" : "primary"}
                    onConfirmar={confirmar}
                    onCancelar={() => setConfirmacion(null)}
                />
            )}
        </div>
    );
};

// Un "chip" del resumen: muestra cuántos hay en ese estado y filtra la tabla
const BotonEstado = ({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
        type="button"
        aria-pressed={activo}
        onClick={onClick}
        className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
            activo ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50",
        )}
    >
        {children}
    </button>
);

export default ListaTicketsLote;
