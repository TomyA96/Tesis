import { useMemo, useState } from "react";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Modal from "../../../ui/componentes/Modal";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { cn } from "../../../../lib/cn";
import { RUTAS } from "../../../constantes/Rutas";
import { coloresEstadoEvento } from "../eventos.columns";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import { formatPrecio, formatPrecioEntrada } from "../../../utils/formatoPrecio";
import type { Entrada } from "../../../services/entradasService";
import type { Jornada } from "../../../services/jornadasService";
import type { PuntoVenta } from "../../../services/puntosVentaService";
import {
    descargarComprobante,
    previaEntrega,
    registrarEntrega,
    textoTramos,
    type DetalleEntrega,
    type EntregaRegistrada,
} from "../../../services/entregasService";

type EntregaPorCantidadProps = {
    idEvento: number;
    jornadas: Jornada[];
    titulos: Record<number, string>;
    lotes: Entrada[];
    puntos: PuntoVenta[];
    // La jornada que se abre al entrar (si se llegó desde su tarjeta)
    jornadaInicial?: number;
    onEntregada: () => void | Promise<void>;
};

/*
    Entregar tickets físicos a un local por cantidad: cada jornada se
    expande y muestra sus lotes impresos; en cada lote se carga cuántos van.
    De cada lote salen los que están en mano, de número más bajo. Antes de
    guardar se muestran los números que salen, y al terminar se descarga el
    comprobante para que el local lo firme.
*/
const EntregaPorCantidad = ({ idEvento, jornadas, titulos, lotes, puntos, jornadaInicial, onEntregada }: EntregaPorCantidadProps) => {
    const [idLocal, setIdLocal] = useState<number | "">("");
    const [expandidas, setExpandidas] = useState<Set<number>>(() => {
        const abiertas = jornadas.filter((j) => j.estado === "Activo" || j.estado === "Suspendido");
        const inicial = jornadaInicial ?? abiertas[0]?.id;
        return new Set(inicial ? [inicial] : []);
    });
    // Por lote, lo que se escribió en su casilla
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [observacion, setObservacion] = useState("");
    const [error, setError] = useState("");
    // Lo que saldría (vista previa), y la entrega ya registrada (para el comprobante)
    const [previa, setPrevia] = useState<DetalleEntrega[] | null>(null);
    const [registrando, setRegistrando] = useState(false);
    const [entregada, setEntregada] = useState<EntregaRegistrada | null>(null);

    // Un lote físico impreso con tickets en mano, de una jornada que sigue abierta
    const entregable = (lote: Entrada, jornada: Jornada) =>
        lote.esFisica && lote.estado === "Disponible" && lote.enMano > 0 && (jornada.estado === "Activo" || jornada.estado === "Suspendido");

    const items = useMemo(
        () =>
            Object.entries(cantidades)
                .map(([idEntrada, texto]) => ({ idEntrada: Number(idEntrada), cantidad: Number(texto) }))
                .filter((i) => Number.isInteger(i.cantidad) && i.cantidad > 0),
        [cantidades],
    );
    const total = items.reduce((suma, i) => suma + i.cantidad, 0);
    const local = puntos.find((p) => p.id === idLocal);

    const alternar = (idJornada: number) =>
        setExpandidas((prev) => {
            const nueva = new Set(prev);
            if (nueva.has(idJornada)) nueva.delete(idJornada);
            else nueva.add(idJornada);
            return nueva;
        });

    const cambiarCantidad = (lote: Entrada, texto: string) => {
        setError("");
        setCantidades((prev) => ({ ...prev, [lote.id]: texto }));
    };

    const validar = () => {
        if (!local) return "Elegí el punto de venta al que le entregás los tickets";
        for (const item of items) {
            const lote = lotes.find((l) => l.id === item.idEntrada);
            if (lote && item.cantidad > lote.enMano) {
                return `${lote.descripcion}: pediste ${item.cantidad} y hay ${lote.enMano} en mano`;
            }
        }
        if (total === 0) return "Cargá cuántos tickets van de al menos un lote";
        return "";
    };

    const verPrevia = async () => {
        const problema = validar();
        setError(problema);
        if (problema || !local) return;
        try {
            setPrevia(await previaEntrega({ idEvento, idPuntoVenta: local.id, items }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo armar la entrega");
        }
    };

    const confirmar = async () => {
        if (!local) return;
        setRegistrando(true);
        try {
            const registrada = await registrarEntrega({ idEvento, idPuntoVenta: local.id, items, observacion: observacion.trim() || undefined });
            setPrevia(null);
            setEntregada(registrada);
            setCantidades({});
            setObservacion("");
            await onEntregada();
        } catch (err) {
            setPrevia(null);
            setError(err instanceof Error ? err.message : "No se pudo registrar la entrega");
        } finally {
            setRegistrando(false);
        }
    };

    const visibles = jornadas.filter((j) => j.estado !== "Borrador");

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-end gap-4">
                <Select
                    label="Entregar a"
                    name="local"
                    className="min-w-[240px]"
                    opciones={[
                        { label: "Elegí un punto de venta", value: "" },
                        ...puntos.filter((p) => p.estado === "Activo").map((p) => ({ label: p.nombre, value: p.id })),
                    ]}
                    value={idLocal}
                    onChange={(e) => {
                        setError("");
                        setIdLocal(e.target.value ? Number(e.target.value) : "");
                    }}
                />
                <p className="pb-2 text-sm text-gray-500">
                    De cada lote salen los tickets en mano de número más bajo. Los números se muestran antes de confirmar.
                </p>
            </div>

            {/* ── JORNADAS: cada una se expande y muestra sus lotes físicos ── */}
            <div className="flex flex-col gap-2">
                {visibles.length === 0 && <p className="text-sm text-gray-400">El evento no tiene jornadas publicadas.</p>}
                {visibles.map((jornada) => {
                    const fisicos = lotes.filter((l) => l.idJornada === jornada.id && l.esFisica && l.estado !== "Borrador");
                    const enMano = fisicos.reduce((suma, l) => suma + l.enMano, 0);
                    const cargados = fisicos.reduce((suma, l) => suma + (Number(cantidades[l.id]) || 0), 0);
                    const abierta = expandidas.has(jornada.id);
                    return (
                        <div key={jornada.id} className="rounded-lg border border-gray-200">
                            <button
                                type="button"
                                aria-expanded={abierta}
                                onClick={() => alternar(jornada.id)}
                                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
                            >
                                <span className={cn("text-gray-400 transition-transform", abierta && "rotate-90")}>▶</span>
                                <span className="font-semibold text-gray-800">{titulos[jornada.id]}</span>
                                <span className="text-gray-500">{fechaCortaConDia(jornada.fechaHoraInicio)}</span>
                                <Etiqueta color={coloresEstadoEvento[jornada.estado]}>{jornada.estado}</Etiqueta>
                                <span className="ml-auto text-xs text-gray-500">
                                    {fisicos.length === 0 ? "sin lotes físicos" : `${enMano} en mano`}
                                    {cargados > 0 && <strong className="ml-2 text-blue-700">· {cargados} a entregar</strong>}
                                </span>
                            </button>

                            {abierta && (
                                <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-200">
                                    {fisicos.length === 0 && (
                                        <p className="px-4 py-3 text-sm text-gray-400">Esta jornada no tiene lotes físicos impresos.</p>
                                    )}
                                    {fisicos.map((lote) => (
                                        <div key={lote.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
                                            <div className="flex min-w-[200px] flex-1 flex-col">
                                                <span className="font-medium text-gray-800">
                                                    {lote.descripcion}
                                                    <span className="ml-2 font-normal text-gray-400">{formatPrecioEntrada(lote.precio)}</span>
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {lote.estado === "Anulado"
                                                        ? "Lote anulado"
                                                        : `En mano ${lote.enMano} de ${lote.cantidad} · en locales ${lote.enLocales} · vendidos ${lote.vendidos}`}
                                                </span>
                                            </div>
                                            {entregable(lote, jornada) && (
                                                <Input
                                                    label="Cantidad"
                                                    name={`cantidad-${lote.id}`}
                                                    type="number"
                                                    min={1}
                                                    max={lote.enMano}
                                                    className="w-24"
                                                    value={cantidades[lote.id] ?? ""}
                                                    onChange={(e) => cambiarCantidad(lote, e.target.value)}
                                                />
                                            )}
                                            <LinkBtn to={RUTAS.eventos.tickets(idEvento, { lote: lote.id })} variant="ghost" size="sm">
                                                Ver tickets
                                            </LinkBtn>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── TOTAL Y CONFIRMAR ─────────────────────────────────────────── */}
            <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Input
                    label="Observación (opcional)"
                    name="observacionEntrega"
                    type="text"
                    maxLength={500}
                    className="min-w-[280px] bg-white"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                />
                <span className="ml-auto pb-2 text-sm text-gray-600">
                    Total a entregar: <strong className="text-gray-900">{total}</strong>
                </span>
                <Btn disabled={total === 0 || idLocal === ""} onClick={verPrevia}>
                    Ver números y confirmar
                </Btn>
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            {/* ── VISTA PREVIA: los números que salen ────────────────────────── */}
            <Modal isOpen={previa !== null} closeModal={() => setPrevia(null)} title={`Entregar ${total} tickets a ${local?.nombre ?? ""}`} maxWidth="640px">
                {previa && (
                    <div className="flex flex-col gap-4 text-sm">
                        <TablaDetalle detalle={previa} />
                        <p className="text-gray-600">Separá estos tickets de papel para el local. Después de confirmar se descarga el comprobante.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Btn onClick={confirmar} disabled={registrando}>
                                {registrando ? "Registrando..." : "Confirmar entrega"}
                            </Btn>
                            <Btn variant="ghost" onClick={() => setPrevia(null)} disabled={registrando}>
                                Volver
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── ENTREGA REGISTRADA: comprobante ───────────────────────────── */}
            <Modal isOpen={entregada !== null} closeModal={() => setEntregada(null)} title="Entrega registrada" maxWidth="640px">
                {entregada && (
                    <div className="flex flex-col gap-4 text-sm">
                        <p role="status" className="text-emerald-700">
                            Se entregaron {entregada.detalle.reduce((s, d) => s + d.cantidad, 0)} tickets a {entregada.puntoVenta.nombre}.
                        </p>
                        <TablaDetalle detalle={entregada.detalle} />
                        <div className="grid grid-cols-2 gap-4">
                            <Btn onClick={() => descargarComprobante(entregada.id, entregada.puntoVenta.nombre)}>Descargar comprobante</Btn>
                            <Btn variant="ghost" onClick={() => setEntregada(null)}>Cerrar</Btn>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// Jornada, lote, cantidad, números y valor de lo que sale en una entrega
const TablaDetalle = ({ detalle }: { detalle: DetalleEntrega[] }) => {
    const valorTotal = detalle.reduce((s, d) => s + Number(d.precio) * d.cantidad, 0);
    return (
        <table className="w-full border-collapse text-sm">
            <thead>
                <tr className="border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="py-2 pr-3">Jornada</th>
                    <th className="py-2 pr-3">Lote</th>
                    <th className="py-2 pr-3 text-right">Cant.</th>
                    <th className="py-2 pr-3">Números</th>
                    <th className="py-2 text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                {detalle.map((d) => (
                    <tr key={d.idEntrada} className="border-b border-gray-100 text-gray-700">
                        <td className="py-2 pr-3">{d.jornada.nombre ?? "Jornada"} · {fechaCortaConDia(d.jornada.fechaHoraInicio)}</td>
                        <td className="py-2 pr-3">{d.descripcion}</td>
                        <td className="py-2 pr-3 text-right">{d.cantidad}</td>
                        <td className="py-2 pr-3 font-medium text-gray-900">{textoTramos(d.tramos)}</td>
                        <td className="py-2 text-right">{formatPrecio(Number(d.precio) * d.cantidad)}</td>
                    </tr>
                ))}
                <tr className="font-semibold text-gray-900">
                    <td className="py-2 pr-3" colSpan={2}>Total</td>
                    <td className="py-2 pr-3 text-right">{detalle.reduce((s, d) => s + d.cantidad, 0)}</td>
                    <td />
                    <td className="py-2 text-right">{formatPrecio(valorTotal)}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default EntregaPorCantidad;
