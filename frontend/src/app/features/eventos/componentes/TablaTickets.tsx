import Etiqueta from "../../../ui/componentes/Etiqueta";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";
import type { Ticket } from "../../../services/ticketsService";
import { etiquetaEstadoTicket } from "../utils/tickets";

type TablaTicketsProps = {
    tickets: Ticket[];
    seleccionados: Set<number>;
    // Con la jornada terminada la tabla es de solo lectura: no hay casillas
    seleccionable: boolean;
    onCambiarSeleccion: (ids: number[], seleccionar: boolean) => void;
};

/*
    Igual que GenericTable pero con una casilla por fila. Tocar la fila
    entera también la marca, que con cientos de tickets es más cómodo que
    apuntarle a la casilla.
*/
const TablaTickets = ({ tickets, seleccionados, seleccionable, onCambiarSeleccion }: TablaTicketsProps) => {
    const todosMarcados = tickets.length > 0 && tickets.every((t) => seleccionados.has(t.id));

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {seleccionable && (
                            <th className="w-12 px-6 py-3">
                                <input
                                    type="checkbox"
                                    aria-label="Seleccionar todos los tickets de la lista"
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                    checked={todosMarcados}
                                    onChange={() => onCambiarSeleccion(tickets.map((t) => t.id), !todosMarcados)}
                                />
                            </th>
                        )}
                        <th className="px-6 py-3">Nº</th>
                        <th className="px-6 py-3">Lote</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3">Estado</th>
                        <th className="px-6 py-3">Punto de venta</th>
                        <th className="px-6 py-3 text-right">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                                No hay tickets para mostrar
                            </td>
                        </tr>
                    ) : (
                        tickets.map((ticket) => {
                            const marcado = seleccionados.has(ticket.id);
                            const estado = etiquetaEstadoTicket[ticket.estado];
                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={seleccionable ? () => onCambiarSeleccion([ticket.id], !marcado) : undefined}
                                    className={`border-b border-gray-100 last:border-none text-sm text-gray-700 transition-colors ${
                                        seleccionable ? "cursor-pointer" : ""
                                    } ${marcado ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                >
                                    {seleccionable && (
                                        <td className="px-6 py-3">
                                            <input
                                                type="checkbox"
                                                aria-label={`Seleccionar el ticket ${ticket.numero} de ${ticket.entrada.descripcion}`}
                                                className="h-4 w-4 cursor-pointer accent-blue-600"
                                                checked={marcado}
                                                // El click ya lo maneja la fila: así no se marca y desmarca dos veces
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={() => onCambiarSeleccion([ticket.id], !marcado)}
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-3 font-medium text-gray-900">{ticket.numero}</td>
                                    <td className="px-6 py-3">{ticket.entrada.descripcion}</td>
                                    <td className="px-6 py-3 text-gray-500">{ticket.entrada.esFisica ? "Física" : "Online"}</td>
                                    <td className="px-6 py-3">
                                        <Etiqueta color={estado.color}>{estado.texto}</Etiqueta>
                                    </td>
                                    <td className="px-6 py-3">{ticket.puntoVenta?.nombre ?? "—"}</td>
                                    <td className="px-6 py-3 text-right">{formatPrecioEntrada(Number(ticket.precio))}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TablaTickets;
