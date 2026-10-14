import { Minus, Plus } from "lucide-react";
import type { EntradaPublica } from "../../../services/eventosService";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";


type EntradaDetalleProps = {
    entrada: EntradaPublica;
    cantidad: number;
    
    onCambiarCantidad: (cambio: number) => void;
};

const EntradaDetalle = ({ entrada, cantidad, onCambiarCantidad }: EntradaDetalleProps) => {
    const subTotal = cantidad * Number(entrada.precio)
    // El precio llega como texto (es un Decimal en la base): convertirlo
    // con Number() y formatearlo en pesos (toLocaleString "es-AR", ARS).
    const precioUnitario = Number(entrada.precio);

    const restar = () => onCambiarCantidad(-1);
    const sumar = () => onCambiarCantidad(1);

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4 text-gray-600">
                <h3 className="font-semibold ">{entrada.descripcion}</h3>
                {/* Precio unitario formateado */}
                <span className="font-semibold ">{formatPrecioEntrada(precioUnitario)}</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-gray-600">
                {/* Selector de cantidad: − número + */}
                <div className="flex items-center gap-3  ">
                    <button type="button" onClick={restar} aria-label="Quitar una entrada"
                        className="rounded-full border border-gray-300 p-1 hover:bg-gray-100 cursor-pointer">
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{cantidad}</span>
                    <button type="button" onClick={sumar} aria-label="Agregar una entrada"
                        className="rounded-full border border-gray-300 p-1  hover:bg-gray-100 cursor-pointer">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Total de esta fila (precio por cantidad) y botón de compra */}
                <div className="flex items-center justify-between">
                    { cantidad > 0 && subTotal > 0 &&
                        
                        <span className="flex text-sm items-center">Subtotal: 
                            <p className="ml-4 font-semibold">{formatPrecioEntrada(subTotal)}</p> 
                        </span>
                    }
                    
                </div>
            </div>
        </div>
    );
};

export default EntradaDetalle;
