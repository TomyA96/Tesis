import { Minus, Plus } from "lucide-react";
import Btn from "../../../ui/componentes/Btn";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";
import { agruparPorJornada, totalDeLineas, type LineaCompra } from "../compra";

type TuCompraProps = {
    lineas: LineaCompra[];
    onCambiarCantidad: (idEntrada: number, cambio: number) => void;
    onComprar: () => void;
};

/*
    Lo que el cliente va eligiendo, agrupado por jornada. En compu va debajo
    de la imagen (y baja con ella); en celular se abre desde la barra fija
    de abajo. Las líneas se pueden ajustar desde acá sin volver a la jornada.
*/
const TuCompra = ({ lineas, onCambiarCantidad, onComprar }: TuCompraProps) => {
    const total = totalDeLineas(lineas);

    if (lineas.length === 0) {
        return (
            <p className="text-sm text-gray-500">
                Todavía no elegiste entradas. Abrí un evento y sumá las que quieras.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Si se eligen muchas, la lista scrollea sola y el botón Comprar siempre se ve */}
            <div className="flex max-h-[40vh] flex-col gap-4 overflow-y-auto pr-1">
                {agruparPorJornada(lineas).map((grupo) => (
                    <section key={grupo.titulo} className="flex flex-col gap-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{grupo.titulo}</h3>
                        {grupo.lineas.map((linea) => (
                            <div key={linea.idEntrada} className="flex items-center justify-between gap-3 text-sm">
                                <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                                    {linea.descripcion} <span className="font-normal text-gray-500">× {linea.cantidad}</span>
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {formatPrecioEntrada(linea.precioUnitario * linea.cantidad)}
                                </span>
                                <div className="flex gap-1">
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
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-noche">{formatPrecioEntrada(total)}</span>
            </div>
            <Btn size="lg" className="w-full justify-center bg-acento hover:bg-acento-oscuro focus:ring-acento" onClick={onComprar}>
                Comprar
            </Btn>
        </div>
    );
};

export default TuCompra;
