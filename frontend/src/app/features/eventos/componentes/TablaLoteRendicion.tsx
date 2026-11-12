import { useState } from "react";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import { cn } from "../../../../lib/cn";
import { formatPrecio, formatPrecioEntrada } from "../../../utils/formatoPrecio";
import type { TicketPendiente } from "../../../services/rendicionesService";

// Qué informa el local de cada ticket. Arranca todo como vendido: se marca lo que le queda.
export type Resultado = "vendido" | "sigue" | "devuelto";

const textoResultado: Record<Resultado, string> = {
    vendido: "Vendido",
    sigue: "Sigue en el local",
    devuelto: "Devuelto (se anula)",
};

const colorResultado: Record<Resultado, string> = {
    vendido: "bg-emerald-50 text-emerald-700",
    sigue: "bg-amber-50 text-amber-700",
    devuelto: "bg-rose-50 text-rose-700",
};

// "1 vendido" / "3 vendidos"
const segun = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

type TablaLoteRendicionProps = {
    // "General física · Viernes · mié 18/11"
    titulo: string;
    precio: number;
    // Los pendientes de ESTE lote: cada lote tiene su tabla, sus números y su subtotal
    tickets: TicketPendiente[];
    resultadoDe: (t: TicketPendiente) => Resultado;
    onAplicar: (ids: number[], resultado: Resultado) => void;
};

/*
    Una tabla por lote dentro de la rendición: así no se mezclan precios ni
    numeraciones. Cada una tiene su rango "del Nº al Nº" (los números son
    de este lote) y su subtotal; la plata y la comisión se cargan una sola
    vez, abajo de todas.
*/
const TablaLoteRendicion = ({ titulo, precio, tickets, resultadoDe, onAplicar }: TablaLoteRendicionProps) => {
    const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [error, setError] = useState("");

    // Un Usado ya entró al evento: se vendió sí o sí, no se puede cambiar
    const cambiables = tickets.filter((t) => t.estado !== "Usado");
    const todosMarcados = cambiables.length > 0 && cambiables.every((t) => seleccion.has(t.id));

    const cambiarSeleccion = (ids: number[], marcar: boolean) =>
        setSeleccion((prev) => {
            const nueva = new Set(prev);
            ids.forEach((id) => (marcar ? nueva.add(id) : nueva.delete(id)));
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
        const enRango = cambiables.filter((t) => Number(t.numero) >= inicio && Number(t.numero) <= fin);
        cambiarSeleccion(enRango.map((t) => t.id), true);
    };

    const aplicar = (resultado: Resultado) => {
        onAplicar([...seleccion], resultado);
        setSeleccion(new Set());
        setError("");
    };

    const contar = (resultado: Resultado) => tickets.filter((t) => resultadoDe(t) === resultado).length;
    const vendidos = contar("vendido");

    return (
        <section className="flex flex-col rounded-lg border border-gray-200">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 px-4 py-3">
                <h3 className="font-semibold text-gray-900">{titulo}</h3>
                <span className="text-sm text-gray-500">{formatPrecioEntrada(precio)} c/u · {tickets.length} pendientes</span>
            </header>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 bg-gray-50 px-4 py-3">
                <div className="flex items-end gap-2">
                    <Input label="Del Nº" name={`desde-${tickets[0]?.entrada.id}`} type="number" min={1} className="w-20 bg-white" value={desde} onChange={(e) => setDesde(e.target.value)} />
                    <Input label="al Nº" name={`hasta-${tickets[0]?.entrada.id}`} type="number" min={1} className="w-20 bg-white" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                    <Btn variant="outline" size="sm" className="mb-1" disabled={!desde || !hasta} onClick={marcarRango}>
                        Marcar rango
                    </Btn>
                </div>
                <div className="flex flex-wrap items-center gap-2 pb-1">
                    <span className="text-sm text-gray-600">
                        Marcados: <strong className="text-gray-900">{seleccion.size}</strong>
                    </span>
                    <Btn size="sm" variant="success" disabled={seleccion.size === 0} onClick={() => aplicar("vendido")}>Vendidos</Btn>
                    <Btn size="sm" variant="warning" disabled={seleccion.size === 0} onClick={() => aplicar("sigue")}>Siguen en el local</Btn>
                    <Btn size="sm" variant="danger" disabled={seleccion.size === 0} onClick={() => aplicar("devuelto")}>Devueltos</Btn>
                </div>
            </div>
            {error && <p role="alert" className="px-4 pt-2 text-sm text-red-600">{error}</p>}

            <div className="max-h-[320px] overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-white">
                        <tr className="border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="w-12 px-4 py-2">
                                <input
                                    type="checkbox"
                                    aria-label={`Marcar todos los tickets de ${titulo}`}
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                    checked={todosMarcados}
                                    onChange={() => cambiarSeleccion(cambiables.map((t) => t.id), !todosMarcados)}
                                />
                            </th>
                            <th className="px-4 py-2">Nº</th>
                            <th className="px-4 py-2">Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((t) => {
                            const usado = t.estado === "Usado";
                            const marcado = seleccion.has(t.id);
                            const resultado = resultadoDe(t);
                            return (
                                <tr
                                    key={t.id}
                                    onClick={usado ? undefined : () => cambiarSeleccion([t.id], !marcado)}
                                    className={cn(
                                        "border-b border-gray-100 last:border-none text-gray-700",
                                        !usado && "cursor-pointer",
                                        marcado ? "bg-blue-50" : "hover:bg-gray-50",
                                    )}
                                >
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            aria-label={`Marcar el ticket ${t.numero} de ${titulo}`}
                                            className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                                            disabled={usado}
                                            checked={marcado}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => cambiarSeleccion([t.id], !marcado)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-900">{t.numero}</td>
                                    <td className="px-4 py-2">
                                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", colorResultado[resultado])}>
                                            {usado ? "Vendido (ya entró)" : textoResultado[resultado]}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <footer className="flex flex-wrap justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
                <span>
                    {segun(vendidos, "vendido", "vendidos")} · {segun(contar("sigue"), "sigue", "siguen")} ·{" "}
                    {segun(contar("devuelto"), "devuelto", "devueltos")}
                </span>
                <span>
                    Subtotal: <strong className="text-gray-900">{formatPrecio(vendidos * precio)}</strong>
                </span>
            </footer>
        </section>
    );
};

export default TablaLoteRendicion;
