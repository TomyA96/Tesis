import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { horaArgentina } from "../../../utils/zonaHoraria";
import type { VentaPuerta, VentasPuerta } from "../../../services/boleteriaService";

type VentasPuertaDeLaJornadaProps = {
    datos: VentasPuerta | null;
    onAnular: (venta: VentaPuerta) => Promise<void>;
    onReemitir: (venta: VentaPuerta) => Promise<void>;
};

// "1 ticket" / "3 tickets"
const tickets = (n: number) => `${n} ${n === 1 ? "ticket" : "tickets"}`;

/*
    Las ventas de la boletería de la jornada, en una barra como la del
    buffet: cerrada muestra cuántas ventas y tickets hay y el total; abierta
    lista cada venta. Tocándola se ven sus tickets (los anulados por una
    reemisión quedan tachados) y quién la anuló o reemitió.

    Anular: solo si ningún ticket entró todavía. Reemitir: anula los tickets
    que no entraron y saca otros nuevos, sin cobrar de nuevo.
*/
const VentasPuertaDeLaJornada = ({ datos, onAnular, onReemitir }: VentasPuertaDeLaJornadaProps) => {
    const [abierta, setAbierta] = useState(false);
    const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null);
    const [confirmacion, setConfirmacion] = useState<{ accion: "anular" | "reemitir"; venta: VentaPuerta } | null>(null);

    const ventas = datos?.ventas ?? [];

    return (
        <section aria-label="Ventas en puerta de la jornada" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setAbierta((a) => !a)}
                aria-expanded={abierta}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left"
            >
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold text-slate-900">Ventas de la boletería</span>
                    <span className="text-sm text-slate-500">
                        {datos
                            ? `${datos.cantidad} ${datos.cantidad === 1 ? "venta" : "ventas"} · ${tickets(datos.tickets)}`
                            : "Cargando…"}
                    </span>
                    {datos && datos.sobreventas > 0 && (
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            {datos.sobreventas} con sobreventa
                        </span>
                    )}
                </span>
                <span className="flex items-center gap-3">
                    {datos && <span className="text-lg font-bold tabular-nums text-slate-900">{formatPrecio(Number(datos.total))}</span>}
                    <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", abierta && "rotate-180")} />
                </span>
            </button>

            {abierta && datos && (
                <div className="border-t border-slate-100">
                    {/* Lo que tendría que haber en la caja de la boletería, por medio de pago */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 bg-slate-50 px-6 py-3 text-sm text-slate-600">
                        {datos.porMedioPago.map((m) => (
                            <span key={m.medioPago}>
                                {m.medioPago}: <strong className="text-slate-900">{formatPrecio(Number(m.total))}</strong>
                            </span>
                        ))}
                    </div>

                    {ventas.length === 0 ? (
                        <p className="px-6 py-6 text-sm text-slate-400">Todavía no hay ventas en la boletería.</p>
                    ) : (
                        <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                            {ventas.map((venta) => {
                                const anulada = venta.estado === "Anulada";
                                const verDetalle = detalleAbierto === venta.id;
                                const vigentes = venta.tickets.filter((t) => t.estado === "Vendido");
                                const algunoEntro = venta.tickets.some((t) => t.estado === "Usado");
                                return (
                                    <li key={venta.id}>
                                        <div className="flex items-center gap-3 px-6 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setDetalleAbierto(verDetalle ? null : venta.id)}
                                                aria-expanded={verDetalle}
                                                className="grid flex-1 cursor-pointer grid-cols-[4rem_3.5rem_4.5rem_1fr_5rem_7rem] items-center gap-3 text-left text-sm"
                                            >
                                                <span className="font-semibold text-slate-800">N° {venta.id}</span>
                                                <span className="text-slate-500">{horaArgentina(venta.fechaHora)}</span>
                                                <span className="text-slate-600">{tickets(venta.cantidad)}</span>
                                                <span className="truncate text-slate-600">
                                                    {venta.usuario.nombre}
                                                    {venta.esSobreventa && (
                                                        <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                            Sobreventa
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-slate-600">{venta.medioPago}</span>
                                                <span className={cn("text-right font-semibold tabular-nums", anulada ? "text-slate-400 line-through" : "text-slate-900")}>
                                                    {formatPrecio(Number(venta.total))}
                                                </span>
                                            </button>
                                            <div className="flex w-44 shrink-0 justify-end gap-2">
                                                {anulada ? (
                                                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Anulada</span>
                                                ) : (
                                                    <>
                                                        {vigentes.length > 0 && (
                                                            <Btn variant="outline" size="sm" onClick={() => setConfirmacion({ accion: "reemitir", venta })}>
                                                                Reemitir
                                                            </Btn>
                                                        )}
                                                        {!algunoEntro && (
                                                            <Btn variant="outline" size="sm" onClick={() => setConfirmacion({ accion: "anular", venta })}>
                                                                Anular
                                                            </Btn>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {verDetalle && (
                                            <div className="mx-6 mb-3 flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                                                <p className="text-slate-600">
                                                    {tickets(venta.cantidad)} a {formatPrecio(Number(venta.precioUnitario))} c/u
                                                </p>
                                                <p className="flex flex-wrap gap-x-3 gap-y-1">
                                                    {venta.tickets.map((t) => (
                                                        <span
                                                            key={t.id}
                                                            className={cn(
                                                                "tabular-nums",
                                                                t.estado === "Anulado" ? "text-slate-400 line-through" : "text-slate-700",
                                                            )}
                                                            title={t.estado}
                                                        >
                                                            #{t.numero}
                                                            {t.estado === "Usado" && " (entró)"}
                                                        </span>
                                                    ))}
                                                </p>
                                                {venta.reemisiones > 0 && venta.fechaReemision && (
                                                    <p className="text-xs text-slate-500">
                                                        Reemitida {venta.reemisiones === 1 ? "una vez" : `${venta.reemisiones} veces`}; la última a las{" "}
                                                        {horaArgentina(venta.fechaReemision)}
                                                        {venta.usuarioReemision ? ` por ${venta.usuarioReemision.nombre}` : ""}
                                                    </p>
                                                )}
                                                {anulada && venta.fechaAnulacion && (
                                                    <p className="text-xs text-red-700">
                                                        Anulada a las {horaArgentina(venta.fechaAnulacion)}
                                                        {venta.usuarioAnulacion ? ` por ${venta.usuarioAnulacion.nombre}` : ""}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {confirmacion && (
                <ConfirmarAccion
                    isOpen
                    title={confirmacion.accion === "anular" ? "Anular venta" : "Reemitir tickets"}
                    variante={confirmacion.accion === "anular" ? "danger" : "primary"}
                    mensaje={
                        confirmacion.accion === "anular"
                            ? `Anular la venta N° ${confirmacion.venta.id} de ${formatPrecio(Number(confirmacion.venta.total))} (sus tickets dejan de servir para entrar y la venta no cuenta en la caja ni en los informes; no se puede deshacer)`
                            : `Reemitir la venta N° ${confirmacion.venta.id} (se anulan sus tickets que no entraron, los papeles impresos dejan de servir, y se imprimen otros nuevos; no se cobra de nuevo)`
                    }
                    onConfirmar={async () => {
                        const { accion, venta } = confirmacion;
                        await (accion === "anular" ? onAnular(venta) : onReemitir(venta));
                        setConfirmacion(null);
                    }}
                    onCancelar={() => setConfirmacion(null)}
                />
            )}
        </section>
    );
};

export default VentasPuertaDeLaJornada;
