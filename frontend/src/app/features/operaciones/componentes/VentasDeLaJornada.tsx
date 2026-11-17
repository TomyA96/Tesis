import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { horaArgentina } from "../../../utils/zonaHoraria";
import type { VentaBuffet, VentasDeJornada } from "../../../services/buffetService";

type VentasDeLaJornadaProps = {
    datos: VentasDeJornada | null;
    onAnular: (venta: VentaBuffet) => Promise<void>;
};

/*
    Las ventas del buffet de la jornada, en una barra que ocupa poco: cerrada
    muestra cuántas ventas hay y el total (un control rápido de la caja).
    Abierta lista cada venta; tocándola se ven sus productos, y desde ahí se
    anula si fue un error. Las anuladas quedan a la vista, tachadas, y no
    suman al total.
*/
const VentasDeLaJornada = ({ datos, onAnular }: VentasDeLaJornadaProps) => {
    const [abierta, setAbierta] = useState(false);
    const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null);
    const [aAnular, setAAnular] = useState<VentaBuffet | null>(null);

    const ventas = datos?.ventas ?? [];

    return (
        <section aria-label="Ventas de la jornada" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setAbierta((a) => !a)}
                aria-expanded={abierta}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left"
            >
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold text-slate-900">Ventas de la jornada</span>
                    <span className="text-sm text-slate-500">
                        {datos ? `${datos.cantidad} ${datos.cantidad === 1 ? "venta" : "ventas"}` : "Cargando…"}
                    </span>
                </span>
                <span className="flex items-center gap-3">
                    {datos && <span className="text-lg font-bold tabular-nums text-slate-900">{formatPrecio(Number(datos.total))}</span>}
                    <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", abierta && "rotate-180")} />
                </span>
            </button>

            {abierta && datos && (
                <div className="border-t border-slate-100">
                    {/* Lo que tendría que haber en la caja, por medio de pago */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 bg-slate-50 px-6 py-3 text-sm text-slate-600">
                        {datos.porMedioPago.map((m) => (
                            <span key={m.medioPago}>
                                {m.medioPago}: <strong className="text-slate-900">{formatPrecio(Number(m.total))}</strong>
                            </span>
                        ))}
                    </div>

                    {ventas.length === 0 ? (
                        <p className="px-6 py-6 text-sm text-slate-400">Todavía no hay ventas en esta jornada.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                            {ventas.map((venta) => {
                                const anulada = venta.estado === "Anulada";
                                const verDetalle = detalleAbierto === venta.id;
                                return (
                                    <li key={venta.id}>
                                        <div className="flex items-center gap-3 px-6 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setDetalleAbierto(verDetalle ? null : venta.id)}
                                                aria-expanded={verDetalle}
                                                className="grid flex-1 cursor-pointer grid-cols-[4rem_3.5rem_1fr_5rem_7rem] items-center gap-3 text-left text-sm"
                                            >
                                                <span className="font-semibold text-slate-800">N° {venta.id}</span>
                                                <span className="text-slate-500">{horaArgentina(venta.fechaHora)}</span>
                                                <span className="truncate text-slate-600">{venta.usuario.nombre}</span>
                                                <span className="text-slate-600">{venta.medioPago}</span>
                                                <span className={cn("text-right font-semibold tabular-nums", anulada ? "text-slate-400 line-through" : "text-slate-900")}>
                                                    {formatPrecio(Number(venta.total))}
                                                </span>
                                            </button>
                                            <div className="w-24 shrink-0 text-right">
                                                {anulada ? (
                                                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Anulada</span>
                                                ) : (
                                                    <Btn variant="outline" size="sm" onClick={() => setAAnular(venta)}>
                                                        Anular
                                                    </Btn>
                                                )}
                                            </div>
                                        </div>

                                        {verDetalle && (
                                            <div className="mx-6 mb-3 flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                                                {venta.detalleVenta.map((d) => (
                                                    <div key={d.producto.id} className="flex justify-between gap-3 text-slate-600">
                                                        <span>{d.cantidad} × {d.producto.nombre}</span>
                                                        <span className="tabular-nums">{formatPrecio(Number(d.subtotal))}</span>
                                                    </div>
                                                ))}
                                                {anulada && venta.fechaAnulacion && (
                                                    <p className="mt-1 text-xs text-red-700">
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

            <ConfirmarAccion
                isOpen={aAnular !== null}
                title="Anular venta"
                mensaje={aAnular ? `Anular la venta N° ${aAnular.id} de ${formatPrecio(Number(aAnular.total))} (deja de contar en la caja y en los informes; no se puede deshacer)` : ""}
                onConfirmar={async () => {
                    if (!aAnular) return;
                    await onAnular(aAnular);
                    setAAnular(null);
                }}
                onCancelar={() => setAAnular(null)}
            />
        </section>
    );
};

export default VentasDeLaJornada;
