import Btn from "../../../ui/componentes/Btn";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import type { TipoProducto } from "../../../services/productosService";

type ProductoVentaCardProps = {
  nombre: string;
  precio: number;
  tipo: TipoProducto;
  cantidad: number;
  onSumar: () => void;
  onRestar: () => void;
};

// La franja de color distingue comidas (naranja) de bebidas (azul) de un vistazo
const colorPorTipo: Record<TipoProducto, string> = {
  Comida: "from-amber-500 to-orange-400",
  Bebida: "from-blue-600 to-sky-400",
};

/*
    Un producto del catálogo del buffet, en formato compacto para que entren
    muchos sin scrollear: una franja fina de color arriba (naranja comida,
    azul bebida), el nombre, el precio y los botones. Tocar el nombre o el
    "+" suma uno a la venta en curso; el "−" resta. La cantidad elegida se
    marca en la tarjeta.
*/
const ProductoVentaCard = ({ nombre, precio, tipo, cantidad, onSumar, onRestar }: ProductoVentaCardProps) => {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-colors",
        cantidad > 0 ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300",
      )}
    >
      <span aria-hidden className={cn("h-2 w-full bg-gradient-to-r", colorPorTipo[tipo])} />
      <div className={cn("flex flex-col gap-2 p-3", cantidad > 0 && "bg-blue-50/40")}>
        <button type="button" onClick={onSumar} className="flex cursor-pointer items-start justify-between gap-2 text-left">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{nombre}</h3>
          {cantidad > 0 && (
            <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 px-2 text-sm font-bold text-white">
              {cantidad}
            </span>
          )}
        </button>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold tracking-tight text-slate-900">{formatPrecio(precio)}</span>
          <div className="flex gap-1.5">
            <Btn variant="outline" size="icon" className="rounded-full" onClick={onRestar} disabled={cantidad === 0} aria-label={`Quitar un ${nombre}`}>
              <Minus className="h-4 w-4" />
            </Btn>
            <Btn size="icon" className="rounded-full" onClick={onSumar} aria-label={`Sumar un ${nombre}`}>
              <Plus className="h-4 w-4" />
            </Btn>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductoVentaCard;
