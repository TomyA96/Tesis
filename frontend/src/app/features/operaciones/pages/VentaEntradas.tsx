import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CreditCard, Minus, Plus, QrCode, Ticket, Users, Wallet } from "lucide-react";
import Btn from "../../../ui/componentes/Btn";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import VentasPuertaDeLaJornada from "../componentes/VentasPuertaDeLaJornada";
import ImprimirTickets from "../componentes/ImprimirTickets";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { RUTAS } from "../../../constantes/Rutas";
import type { Jornada } from "../../../services/jornadasService";
import type { MedioPagoBuffet } from "../../../services/buffetService";
import {
    anularVentaPuerta,
    getEstadoBoleteria,
    getVentasPuerta,
    reemitirVentaPuerta,
    venderEnPuerta,
    type EstadoBoleteria,
    type NivelOcupacion,
    type OcupacionPuerta,
    type VentasPuerta,
} from "../../../services/boleteriaService";

const iconoMedio: Record<MedioPagoBuffet, React.ReactNode> = {
    Efectivo: <Wallet className="h-4 w-4" />,
    Tarjeta: <CreditCard className="h-4 w-4" />,
    QR: <QrCode className="h-4 w-4" />,
};

const MEDIO_POR_DEFECTO: MedioPagoBuffet = "Efectivo";
// Mismo tope que el backend (y que la compra online)
const MAXIMO_POR_VENTA = 10;
// Cada cuánto se actualiza la capacidad: otras boleterías venden y la gente va entrando
const REFRESCO_MS = 15_000;

// "1 ticket" / "3 tickets"
const tickets = (n: number) => `${n} ${n === 1 ? "ticket" : "tickets"}`;

/*
    La boletería de una jornada: se vende la entrada «General Boletería»
    (precio configurado desde el evento), de a uno o varios tickets por
    venta, y se imprimen en el momento. La jornada llega del layout
    (OperacionesJornadaLayout), que ya controló que se pueda operar.

    La capacidad no bloquea: se pinta en azul, amarillo (desde el 80 %) y
    rojo (llena). Una venta que pasa la capacidad es una sobreventa: pide
    confirmación y queda registrada a nombre de quien la hizo.
*/
const VentaEntradas = () => {
    const jornada = useOutletContext<Jornada>();

    const [estado, setEstado] = useState<EstadoBoleteria | null>(null);
    const [ventas, setVentas] = useState<VentasPuerta | null>(null);
    const [error, setError] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [medioPago, setMedioPago] = useState<MedioPagoBuffet>(MEDIO_POR_DEFECTO);
    const [vendiendo, setVendiendo] = useState(false);
    const [confirmandoSobreventa, setConfirmandoSobreventa] = useState(false);
    const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
    // El PDF a imprimir (de una venta o de una reemisión) y el título de la ventana
    const [impresion, setImpresion] = useState<{ pdf: Blob; titulo: string } | null>(null);

    const recargar = useCallback(async () => {
        try {
            const [estadoBuscado, ventasBuscadas] = await Promise.all([getEstadoBoleteria(jornada.id), getVentasPuerta(jornada.id)]);
            setEstado(estadoBuscado);
            setVentas(ventasBuscadas);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cargar la boletería");
        }
    }, [jornada.id]);

    useEffect(() => {
        recargar();
        const intervalo = setInterval(recargar, REFRESCO_MS);
        return () => clearInterval(intervalo);
    }, [recargar]);

    if (error && !estado) {
        return <p role="alert" className="px-6 text-sm text-red-600">{error}</p>;
    }
    if (!estado) {
        return <p className="px-6 text-sm text-gray-500">Cargando boletería…</p>;
    }

    const { boleteria, ocupacion } = estado;

    // ── Sin boletería configurada: no hay nada para vender ─────────────────
    if (!boleteria) {
        return (
            <ContenedorDatos className="mx-6 flex flex-col items-center gap-3 p-10 text-center">
                <Ticket className="h-10 w-10 text-slate-300" />
                <h2 className="text-lg font-semibold text-gray-800">Falta configurar la boletería de esta jornada</h2>
                <p className="max-w-md text-sm text-gray-500">
                    Para vender entradas en la puerta, configurá el precio desde la pantalla del evento con el botón
                    «Configurar boletería».
                </p>
                <LinkBtn to={RUTAS.eventos.detalle(jornada.idEvento)} variant="outline" size="sm">
                    Ir al evento
                </LinkBtn>
            </ContenedorDatos>
        );
    }

    const precio = Number(boleteria.precio);
    const total = precio * cantidad;
    // Con esta venta se pasaría (o ya se pasó) de la capacidad: es una sobreventa
    const quedaSobreventa = ocupacion.comprometidos + cantidad > ocupacion.capacidad;

    const vender = async (confirmarSobreventa: boolean) => {
        const pdf = await venderEnPuerta(jornada.id, { cantidad, medioPago, confirmarSobreventa });
        setImpresion({ pdf, titulo: `${tickets(cantidad)} · ${formatPrecio(total)} en ${medioPago}` });
        setAviso({ tipo: "ok", texto: `Venta registrada: ${tickets(cantidad)} por ${formatPrecio(total)} en ${medioPago}` });
        setCantidad(1);
        setMedioPago(MEDIO_POR_DEFECTO);
        await recargar();
    };

    const onVender = async () => {
        if (vendiendo) return;
        setAviso(null);
        if (quedaSobreventa) {
            setConfirmandoSobreventa(true);
            return;
        }
        setVendiendo(true);
        try {
            await vender(false);
        } catch (err) {
            const texto = err instanceof Error ? err.message : "No se pudo registrar la venta";
            // Otra boletería llenó la jornada mientras tanto: ahora es una sobreventa y hay que confirmarla
            if (texto.startsWith("Sobreventa")) {
                await recargar();
                setConfirmandoSobreventa(true);
            } else {
                setAviso({ tipo: "error", texto });
            }
        } finally {
            setVendiendo(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 px-6">
            <VentasPuertaDeLaJornada
                datos={ventas}
                onAnular={async (venta) => {
                    await anularVentaPuerta(jornada.id, venta.id);
                    await recargar();
                }}
                onReemitir={async (venta) => {
                    const pdf = await reemitirVentaPuerta(jornada.id, venta.id);
                    setImpresion({ pdf, titulo: `Venta N° ${venta.id} reemitida` });
                    await recargar();
                }}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                {/* ── VENTA ───────────────────────────────────────────────── */}
                <ContenedorDatos className="h-fit">
                    <Header titulo="Venta en puerta" />
                    <div className="flex flex-col gap-6 p-6">
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Entrada</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">{boleteria.descripcion}</p>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-slate-900">{formatPrecio(precio)}</p>
                        </div>

                        {!boleteria.habilitada ? (
                            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                La venta en puerta de esta jornada está pausada. Se reanuda desde la pantalla del evento, en
                                «Configurar boletería».
                            </p>
                        ) : (
                            <>
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cantidad</p>
                                    <div className="flex items-center gap-4">
                                        <Btn
                                            variant="outline"
                                            size="icon"
                                            aria-label="Uno menos"
                                            disabled={cantidad <= 1 || vendiendo}
                                            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                        >
                                            <Minus className="h-5 w-5" />
                                        </Btn>
                                        <span className="w-12 text-center text-3xl font-bold tabular-nums text-slate-900" aria-live="polite">
                                            {cantidad}
                                        </span>
                                        <Btn
                                            variant="outline"
                                            size="icon"
                                            aria-label="Uno más"
                                            disabled={cantidad >= MAXIMO_POR_VENTA || vendiendo}
                                            onClick={() => setCantidad((c) => Math.min(MAXIMO_POR_VENTA, c + 1))}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Btn>
                                        <span className="text-sm text-slate-500">hasta {MAXIMO_POR_VENTA} por venta</span>
                                    </div>
                                </div>

                                <div role="radiogroup" aria-label="Medio de pago" className="flex flex-col gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Medio de pago</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(Object.keys(iconoMedio) as MedioPagoBuffet[]).map((medio) => (
                                            <button
                                                key={medio}
                                                type="button"
                                                role="radio"
                                                aria-checked={medioPago === medio}
                                                onClick={() => setMedioPago(medio)}
                                                className={cn(
                                                    "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                                                    medioPago === medio
                                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                                                )}
                                            >
                                                {iconoMedio[medio]}
                                                {medio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Total</span>
                                    <span className="text-3xl font-bold tracking-tight text-slate-900">{formatPrecio(total)}</span>
                                </div>

                                {aviso && (
                                    <p
                                        role={aviso.tipo === "error" ? "alert" : "status"}
                                        className={cn(
                                            "rounded-lg px-4 py-3 text-sm",
                                            aviso.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
                                        )}
                                    >
                                        {aviso.texto}
                                    </p>
                                )}

                                <Btn
                                    variant={quedaSobreventa ? "danger" : "success"}
                                    size="lg"
                                    className="justify-center gap-2"
                                    disabled={vendiendo}
                                    onClick={onVender}
                                >
                                    <Ticket className="h-5 w-5" />
                                    {vendiendo ? "Vendiendo…" : quedaSobreventa ? `Vender ${tickets(cantidad)} con sobreventa` : `Vender ${tickets(cantidad)}`}
                                </Btn>
                            </>
                        )}
                    </div>
                </ContenedorDatos>

                {/* ── CAPACIDAD ───────────────────────────────────────────── */}
                <CapacidadJornada ocupacion={ocupacion} />
            </div>

            {confirmandoSobreventa && (
                <ConfirmarAccion
                    isOpen
                    title="Sobreventa"
                    variante="danger"
                    mensaje={
                        `Vender ${tickets(cantidad)} por encima de la capacidad: hay ${ocupacion.comprometidos} lugares ocupados sobre ${ocupacion.capacidad}. ` +
                        "La sobreventa queda registrada a tu nombre y es responsabilidad del responsable del evento"
                    }
                    onConfirmar={async () => {
                        setVendiendo(true);
                        try {
                            await vender(true);
                            setConfirmandoSobreventa(false);
                        } finally {
                            setVendiendo(false);
                        }
                    }}
                    onCancelar={() => setConfirmandoSobreventa(false)}
                />
            )}

            <ImprimirTickets pdf={impresion?.pdf ?? null} titulo={impresion?.titulo ?? ""} onCerrar={() => setImpresion(null)} />
        </div>
    );
};

// Los colores de cada nivel: azul, amarillo y rojo
const estilosNivel: Record<NivelOcupacion, { caja: string; barra: string; titulo: string }> = {
    Normal: { caja: "border-sky-200 bg-sky-50 text-sky-900", barra: "bg-sky-500", titulo: "Hay lugar" },
    Alerta: { caja: "border-amber-200 bg-amber-50 text-amber-900", barra: "bg-amber-500", titulo: "Se está llenando" },
    Lleno: { caja: "border-red-200 bg-red-50 text-red-900", barra: "bg-red-600", titulo: "Capacidad completa" },
};

/*
    Cuánto lugar queda, con el color del nivel. Ocupados son los vendidos
    (por cualquier canal), los impresos y los asignados a locales: alguien
    puede llegar con ese papel. Los online sin vender no cuentan, porque la
    venta online ya cerró. Aparte, cuántos ya entraron.
*/
const CapacidadJornada = ({ ocupacion }: { ocupacion: OcupacionPuerta }) => {
    const estilo = estilosNivel[ocupacion.nivel];
    const mensaje =
        ocupacion.nivel === "Lleno"
            ? ocupacion.excedente > 0
                ? `Sobreventa: ${ocupacion.excedente} por encima de la capacidad. Cada venta queda registrada y es responsabilidad del responsable del evento.`
                : "No quedan lugares: desde ahora cada venta es una sobreventa, bajo responsabilidad del responsable del evento."
            : `Quedan ${ocupacion.disponibles} ${ocupacion.disponibles === 1 ? "lugar" : "lugares"}.`;

    return (
        <section aria-label="Capacidad de la jornada" className={cn("flex h-fit flex-col gap-4 rounded-2xl border p-5", estilo.caja)}>
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold">{ocupacion.nivel === "Lleno" && ocupacion.excedente > 0 ? "Sobreventa" : estilo.titulo}</h2>
                <span className="text-2xl font-bold tabular-nums">{ocupacion.porcentaje}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/70">
                <div className={cn("h-full rounded-full transition-all", estilo.barra)} style={{ width: `${Math.min(100, ocupacion.porcentaje)}%` }} />
            </div>
            <p className="text-sm">{mensaje}</p>
            <dl className="flex flex-col gap-1.5 border-t border-current/10 pt-3 text-sm">
                <div className="flex justify-between gap-3">
                    <dt>Ocupados</dt>
                    <dd className="font-semibold tabular-nums">
                        {ocupacion.comprometidos} de {ocupacion.capacidad}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt>Vendidas en la puerta</dt>
                    <dd className="font-semibold tabular-nums">{ocupacion.vendidosEnPuerta}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> Ingresaron
                    </dt>
                    <dd className="font-semibold tabular-nums">{ocupacion.ingresaron}</dd>
                </div>
            </dl>
            <p className="text-xs opacity-80">Ocupados: vendidos por cualquier canal, impresos y en locales. Se actualiza solo.</p>
        </section>
    );
};

export default VentaEntradas;
