import { useState } from "react";
import Btn from "../../../ui/componentes/Btn";
import Modal from "../../../ui/componentes/Modal";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { fechaCortaConDia, horaArgentina } from "../../../utils/zonaHoraria";
import {
    MEDIOS_DEVOLUCION,
    aprobarReembolsos,
    canalDeVenta,
    nombreMedioDevolucion,
    rechazarReembolso,
    type EstadoReembolso,
    type MedioDevolucion,
    type SolicitudReembolso,
} from "../../../services/reembolsosService";

type Filtro = EstadoReembolso | "Todas";

const FILTROS: { filtro: Filtro; titulo: string }[] = [
    { filtro: "Pendiente", titulo: "Pendientes" },
    { filtro: "Procesado", titulo: "Aprobadas" },
    { filtro: "Rechazado", titulo: "Rechazadas" },
    { filtro: "Todas", titulo: "Todas" },
];

const estiloEstado: Record<EstadoReembolso, { texto: string; clase: string }> = {
    Pendiente: { texto: "Pendiente", clase: "bg-amber-50 text-amber-800" },
    Procesado: { texto: "Aprobada", clase: "bg-emerald-50 text-emerald-700" },
    Rechazado: { texto: "Rechazada", clase: "bg-red-50 text-red-700" },
};

type SolicitudesReembolsoProps = {
    idEvento: number;
    solicitudes: SolicitudReembolso[];
    onCambio: (aviso: string) => void | Promise<void>;
};

// El medio que se propone: si son todas online, Mercado Pago (se devuelve desde su panel); si no, efectivo
const medioSugerido = (elegidas: SolicitudReembolso[]): MedioDevolucion =>
    elegidas.length > 0 && elegidas.every((s) => s.ticket.orden) ? "MercadoPago" : "Efectivo";

/*
    Las solicitudes de devolución del evento, filtradas por estado (arranca
    en Pendientes: es lo que hay que resolver). Las pendientes se pueden
    elegir para aprobarlas de una vez, por ejemplo todas las que generó una
    cancelación, indicando cómo se devuelve la plata. Rechazar es de a una
    y pide el motivo. De las online se muestra el contacto del comprador.
*/
const SolicitudesReembolso = ({ idEvento, solicitudes, onCambio }: SolicitudesReembolsoProps) => {
    const [filtro, setFiltro] = useState<Filtro>("Pendiente");
    const [elegidas, setElegidas] = useState<number[]>([]);
    const [aprobando, setAprobando] = useState<SolicitudReembolso[] | null>(null);
    const [medio, setMedio] = useState<MedioDevolucion>("Efectivo");
    const [rechazando, setRechazando] = useState<SolicitudReembolso | null>(null);
    const [comentario, setComentario] = useState("");
    const [error, setError] = useState("");
    const [trabajando, setTrabajando] = useState(false);

    const visibles = filtro === "Todas" ? solicitudes : solicitudes.filter((s) => s.estado === filtro);
    const pendientesVisibles = visibles.filter((s) => s.estado === "Pendiente");
    const elegidasVisibles = pendientesVisibles.filter((s) => elegidas.includes(s.id));
    const cuantas = (estado: EstadoReembolso) => solicitudes.filter((s) => s.estado === estado).length;

    const alternar = (id: number) => setElegidas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const todasElegidas = pendientesVisibles.length > 0 && elegidasVisibles.length === pendientesVisibles.length;

    const abrirAprobar = (lista: SolicitudReembolso[]) => {
        setError("");
        setMedio(medioSugerido(lista));
        setAprobando(lista);
    };

    const confirmarAprobar = async () => {
        if (!aprobando) return;
        setTrabajando(true);
        setError("");
        try {
            const r = await aprobarReembolsos(idEvento, aprobando.map((s) => s.id), medio);
            setAprobando(null);
            setElegidas([]);
            await onCambio(
                `${r.aprobadas} ${r.aprobadas === 1 ? "devolución aprobada" : "devoluciones aprobadas"}` +
                    (r.rechazadas > 0 ? `; ${r.rechazadas} se rechazaron solas porque el ticket ya se había usado` : ""),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo aprobar");
        } finally {
            setTrabajando(false);
        }
    };

    const confirmarRechazo = async () => {
        if (!rechazando) return;
        if (!comentario.trim()) {
            setError("Explicá por qué se rechaza");
            return;
        }
        setTrabajando(true);
        setError("");
        try {
            await rechazarReembolso(rechazando.id, comentario.trim());
            setRechazando(null);
            setComentario("");
            setElegidas((prev) => prev.filter((id) => id !== rechazando.id));
            await onCambio(`Solicitud N° ${rechazando.id} rechazada`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo rechazar");
        } finally {
            setTrabajando(false);
        }
    };

    const montoDe = (lista: SolicitudReembolso[]) => lista.reduce((suma, s) => suma + Number(s.monto), 0);

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" aria-label="Estado de las solicitudes" className="flex gap-1 rounded-xl bg-slate-100 p-1">
                    {FILTROS.map(({ filtro: f, titulo }) => (
                        <button
                            key={f}
                            type="button"
                            role="tab"
                            aria-selected={filtro === f}
                            onClick={() => setFiltro(f)}
                            className={cn(
                                "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                                filtro === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
                            )}
                        >
                            {titulo} <span className="font-normal text-slate-400">({f === "Todas" ? solicitudes.length : cuantas(f)})</span>
                        </button>
                    ))}
                </div>
                {elegidasVisibles.length > 0 && (
                    <Btn variant="success" size="sm" onClick={() => abrirAprobar(elegidasVisibles)}>
                        Aprobar {elegidasVisibles.length} · {formatPrecio(montoDe(elegidasVisibles))}
                    </Btn>
                )}
            </div>

            {visibles.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                    {filtro === "Pendiente" ? "No hay solicitudes pendientes." : "No hay solicitudes en este estado."}
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="w-10 px-3 py-2">
                                    {pendientesVisibles.length > 0 && (
                                        <input
                                            type="checkbox"
                                            aria-label="Elegir todas las pendientes"
                                            checked={todasElegidas}
                                            onChange={() =>
                                                setElegidas(todasElegidas ? [] : pendientesVisibles.map((s) => s.id))
                                            }
                                        />
                                    )}
                                </th>
                                <th className="px-3 py-2">Ticket</th>
                                <th className="px-3 py-2">Comprador / venta</th>
                                <th className="px-3 py-2">Solicitud</th>
                                <th className="px-3 py-2 text-right">Monto</th>
                                <th className="px-3 py-2">Estado</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visibles.map((s) => {
                                const cliente = s.ticket.orden?.cliente;
                                const pendiente = s.estado === "Pendiente";
                                return (
                                    <tr key={s.id} className="align-top">
                                        <td className="px-3 py-3">
                                            {pendiente && (
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Elegir la solicitud ${s.id}`}
                                                    checked={elegidas.includes(s.id)}
                                                    onChange={() => alternar(s.id)}
                                                />
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="font-semibold text-slate-800">
                                                {s.ticket.entrada.descripcion} #{s.ticket.numero}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {s.ticket.entrada.jornada.nombre ?? "Jornada"} {fechaCortaConDia(s.ticket.entrada.jornada.fechaHoraInicio)} ·{" "}
                                                {s.ticket.entrada.jornada.estado.toLowerCase()}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-slate-700">{canalDeVenta(s.ticket)}{s.ticket.orden && ` · orden N° ${s.ticket.orden.id}`}</p>
                                            {cliente && (
                                                <p className="text-xs text-slate-500">
                                                    {cliente.nombre} · DNI {cliente.dni} · {cliente.email}
                                                    {cliente.telefono && ` · ${cliente.telefono}`}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-slate-700">{s.motivo}</p>
                                            <p className="text-xs text-slate-500">
                                                {fechaCortaConDia(s.fechaHora)} {horaArgentina(s.fechaHora)} ·{" "}
                                                {s.origen === "Cancelacion" ? "generada al cancelar" : `cargó ${s.usuarioRegistro?.nombre ?? "—"}`}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-900">{formatPrecio(Number(s.monto))}</td>
                                        <td className="px-3 py-3">
                                            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", estiloEstado[s.estado].clase)}>
                                                {estiloEstado[s.estado].texto}
                                            </span>
                                            {!pendiente && s.fechaResolucion && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {s.medioDevolucion && `${nombreMedioDevolucion[s.medioDevolucion]} · `}
                                                    {fechaCortaConDia(s.fechaResolucion)}
                                                    {s.usuario && ` · ${s.usuario.nombre}`}
                                                </p>
                                            )}
                                            {s.comentario && <p className="mt-1 max-w-56 text-xs text-slate-500">«{s.comentario}»</p>}
                                        </td>
                                        <td className="px-3 py-3">
                                            {pendiente && (
                                                <div className="flex justify-end gap-2">
                                                    <Btn variant="outline" size="sm" onClick={() => abrirAprobar([s])}>
                                                        Aprobar
                                                    </Btn>
                                                    <Btn
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setError("");
                                                            setComentario("");
                                                            setRechazando(s);
                                                        }}
                                                    >
                                                        Rechazar
                                                    </Btn>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Aprobar: cómo se devuelve la plata ────────────────────────── */}
            <Modal isOpen={aprobando !== null} closeModal={() => setAprobando(null)} title="Aprobar devolución" maxWidth="480px">
                {aprobando && (
                    <div className="flex flex-col gap-4 text-sm">
                        <p className="text-slate-700">
                            {aprobando.length === 1
                                ? `Devolver ${formatPrecio(montoDe(aprobando))} del ticket ${aprobando[0].ticket.entrada.descripcion} #${aprobando[0].ticket.numero}.`
                                : `Devolver ${formatPrecio(montoDe(aprobando))} de ${aprobando.length} tickets.`}{" "}
                            Los tickets quedan reembolsados: no sirven para entrar y dejan de contar en la recaudación. No se puede deshacer.
                        </p>
                        <fieldset className="flex flex-col gap-2">
                            <legend className="mb-1 font-medium text-slate-700">¿Cómo se devuelve la plata?</legend>
                            {MEDIOS_DEVOLUCION.map((m) => (
                                <label key={m} className="flex cursor-pointer items-center gap-2">
                                    <input type="radio" name="medio-devolucion" checked={medio === m} onChange={() => setMedio(m)} />
                                    {nombreMedioDevolucion[m]}
                                </label>
                            ))}
                        </fieldset>
                        <p className="text-xs text-slate-500">
                            El sistema registra la devolución; la plata se devuelve por fuera (desde el panel de Mercado Pago, en
                            efectivo o por transferencia).
                        </p>
                        {error && <p role="alert" className="text-red-600">{error}</p>}
                        <div className="grid grid-cols-2 gap-3">
                            <Btn variant="success" onClick={confirmarAprobar} disabled={trabajando}>
                                {trabajando ? "Aprobando…" : "Aprobar"}
                            </Btn>
                            <Btn variant="outline" onClick={() => setAprobando(null)} disabled={trabajando}>
                                Cancelar
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Rechazar: con el motivo ───────────────────────────────────── */}
            <Modal isOpen={rechazando !== null} closeModal={() => setRechazando(null)} title="Rechazar solicitud" maxWidth="480px">
                {rechazando && (
                    <div className="flex flex-col gap-4 text-sm">
                        <p className="text-slate-700">
                            Rechazar la devolución del ticket {rechazando.ticket.entrada.descripcion} #{rechazando.ticket.numero} (
                            {formatPrecio(Number(rechazando.monto))}). El ticket sigue valiendo.
                        </p>
                        <label className="flex flex-col gap-1 font-medium text-slate-700">
                            Motivo del rechazo
                            <textarea
                                value={comentario}
                                maxLength={300}
                                rows={3}
                                onChange={(e) => {
                                    setComentario(e.target.value);
                                    setError("");
                                }}
                                className="rounded-lg border border-gray-300 px-3 py-2 font-normal"
                            />
                        </label>
                        {error && <p role="alert" className="text-red-600">{error}</p>}
                        <div className="grid grid-cols-2 gap-3">
                            <Btn variant="danger" onClick={confirmarRechazo} disabled={trabajando}>
                                {trabajando ? "Rechazando…" : "Rechazar"}
                            </Btn>
                            <Btn variant="outline" onClick={() => setRechazando(null)} disabled={trabajando}>
                                Cancelar
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SolicitudesReembolso;
