import type { Rendicion } from "../../../services/rendicionesService";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";

const comision = (r: Rendicion) => {
    if (r.tipoComision === "Ninguna") return "—";
    const detalle = r.tipoComision === "Porcentaje" ? ` (${Number(r.valorComision)}%)` : "";
    return `${formatPrecio(Number(r.montoComision))}${detalle}`;
};

// Las rendiciones ya registradas del evento (de la más nueva a la más vieja)
const HistorialRendiciones = ({ rendiciones }: { rendiciones: Rendicion[] }) => {
    if (rendiciones.length === 0) {
        return <p className="px-6 py-8 text-center text-sm text-gray-400">Todavía no hay rendiciones registradas</p>;
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Fecha</th>
                        <th className="px-6 py-3">Local</th>
                        <th className="px-6 py-3 text-right">Vendidos</th>
                        <th className="px-6 py-3 text-right">Devueltos</th>
                        <th className="px-6 py-3 text-right">Vendido</th>
                        <th className="px-6 py-3 text-right">Comisión</th>
                        <th className="px-6 py-3 text-right">Recibido</th>
                        <th className="px-6 py-3 text-right">Queda debiendo</th>
                        <th className="px-6 py-3">Registró</th>
                    </tr>
                </thead>
                <tbody>
                    {rendiciones.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 last:border-none text-gray-700" title={r.observacion ?? undefined}>
                            <td className="px-6 py-3 whitespace-nowrap">
                                {fechaArgentina(r.fechaHora)} {horaArgentina(r.fechaHora)}
                            </td>
                            <td className="px-6 py-3 font-medium text-gray-900">{r.puntoVenta.nombre}</td>
                            <td className="px-6 py-3 text-right">{r.cantidadVendidos}</td>
                            <td className="px-6 py-3 text-right">{r.cantidadDevueltos}</td>
                            <td className="px-6 py-3 text-right">{formatPrecio(Number(r.montoVendido))}</td>
                            <td className="px-6 py-3 text-right">{comision(r)}</td>
                            <td className="px-6 py-3 text-right">{formatPrecio(Number(r.montoRecibido))}</td>
                            <td className={`px-6 py-3 text-right ${Number(r.saldoPendiente) > 0 ? "font-medium text-amber-700" : ""}`}>
                                {formatPrecio(Number(r.saldoPendiente))}
                            </td>
                            <td className="px-6 py-3">{r.usuario.nombre}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistorialRendiciones;
