import Btn from "../../../ui/componentes/Btn";
import { agruparPorJornada, type LineaCompra } from "../compra";
import { Minus, Plus } from "lucide-react";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";

type ResumenCompraProps = {
    lineas: LineaCompra[];
    total: number;
    // Cambia la cantidad de una entrada (+1 / -1). La aplica la página.
    onCambiarCantidad: (idEntrada: number, cambio: number) => void;
    onContinuar: () => void;
};

// Primer paso de la compra: lo elegido, agrupado por jornada, con la opción de ajustar cantidades
const ResumenCompra = ({ lineas, total, onCambiarCantidad, onContinuar }: ResumenCompraProps) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-5 rounded-2xl border border-gray-300 p-6 font-semibold md:p-10">
                {agruparPorJornada(lineas).map((grupo) => (
                    <section key={grupo.titulo} className="flex flex-col gap-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{grupo.titulo}</h2>
                        {grupo.lineas.map((linea) => (
                            <div key={linea.idEntrada} className="flex items-end justify-between gap-2">
                                <p>{linea.descripcion} × {linea.cantidad}</p>
                                <span aria-hidden="true" className="mb-1 flex-1 border-b-2 border-dotted border-gray-300" />
                                <div className="flex gap-2">
                                    <p>{formatPrecioEntrada(linea.precioUnitario * linea.cantidad)}</p>
                                    <button
                                        type="button"
                                        onClick={() => onCambiarCantidad(linea.idEntrada, -1)}
                                        aria-label={`Quitar una entrada ${linea.descripcion} de ${grupo.titulo}`}
                                        className="cursor-pointer rounded-full border border-gray-300 p-1 hover:bg-gray-100"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onCambiarCantidad(linea.idEntrada, 1)}
                                        aria-label={`Agregar una entrada ${linea.descripcion} de ${grupo.titulo}`}
                                        className="cursor-pointer rounded-full border border-gray-300 p-1 hover:bg-gray-100"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                ))}

                {lineas.length === 0 && <p className="mb-2 flex justify-center p-10 text-gray-500">No hay entradas seleccionadas. Vuelva al menu anterior</p>}
                {lineas.length > 0 && <p className="mt-2 font-bold">Total: {formatPrecioEntrada(total)}</p>}
            </div>

            <div className="flex justify-end">
                {/* Deshabilitar si se quitó todo (un total de 0 es válido: entradas gratuitas) */}
                <Btn type="button" disabled={lineas.length === 0} onClick={onContinuar}>Continuar</Btn>
            </div>
        </div>
    );
};

export default ResumenCompra;
