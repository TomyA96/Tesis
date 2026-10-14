import Btn from "../../../ui/componentes/Btn";
import type { LineaCompra } from "../compra";
import { Minus, Plus } from "lucide-react";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";

type ResumenCompraProps = {
    lineas: LineaCompra[];
    total: number;
    // Cambia la cantidad de una entrada (+1 / -1). La aplica la página.
    onCambiarCantidad: (idEntrada: number, cambio: number) => void;
    onContinuar: () => void;
};

const ResumenCompra = ({ lineas, total, onCambiarCantidad, onContinuar }: ResumenCompraProps) => {
    
    return (
        <div className="flex flex-col gap-4 ">
            {/* Una fila por línea: descripción, cantidad × precio y botones
                para agregar o quitar una entrada (onCambiarCantidad(id, +1 / -1)). */}
            <div className="flex flex-col gap-4 font-semibold border border-gray-300 rounded-2xl p-12 ">
                {lineas.map((linea) => (
                        <div key={linea.idEntrada} className="flex justify-between items-end gap-2">
                            <div className="">
                                <p className="">{linea.descripcion} × {linea.cantidad}</p>
                            
                        </div>
                        <span aria-hidden="true" className="flex-1 border-b-2 border-dotted border-gray-300 mb-1" />
                        <div className="flex gap-2">
                            <p>{formatPrecioEntrada(linea.precioUnitario * linea.cantidad)}</p>
                            <button type="button" onClick={() => onCambiarCantidad(linea.idEntrada, -1)} aria-label="Quitar una entrada"
                                className="rounded-full border border-gray-300 p-1 hover:bg-gray-100 cursor-pointer">
                                <Minus className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => onCambiarCantidad(linea.idEntrada, 1)} aria-label="Agregar una entrada"
                                className="rounded-full border border-gray-300 p-1  hover:bg-gray-100 cursor-pointer">
                                <Plus className="w-3 h-3" />
                            </button>
                            
                        </div>
                    </div>
                ))}

                {/* Total formateado en pesos */}
                {lineas.length === 0 && <p className="flex text-gray-500 p-10 justify-center mb-2">No hay entradas seleccionadas. Vuelva al menu anterior</p>}
                {lineas.length > 0 && <p className=" font-bold mt-4">Total: {formatPrecioEntrada(total)}</p>}
            </div>
            

            <div className="flex justify-end">
                {/* Deshabilitar si se quitó todo (un total de 0 es válido: entradas gratuitas) */}
                <Btn type="button" disabled={lineas.length === 0} onClick={onContinuar}>Continuar</Btn>
            </div>
        </div>
    );
};

export default ResumenCompra;
