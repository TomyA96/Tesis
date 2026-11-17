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

// El color de la franja distingue comidas de bebidas de un vistazo
const colorPorTipo: Record<TipoProducto, string> = {
  Comida: "from-amber-500 to-orange-400",
  Bebida: "from-blue-600 to-sky-400",
};

/*
    Un producto del catálogo del buffet. Tocar la card o el "+" suma uno a la
    venta en curso; el "−" resta. La cantidad elegida se muestra sobre la franja.
*/
const ProductoVentaCard = ({ nombre, precio, tipo, cantidad, onSumar, onRestar }: ProductoVentaCardProps) => {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
        cantidad > 0 ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200",
      )}
    >
      <button type="button" onClick={onSumar} className={`relative block h-20 w-full cursor-pointer bg-gradient-to-br ${colorPorTipo[tipo]}`}>
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_40%)]" />
        <span className="absolute bottom-3 left-4 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {tipo}
        </span>
        {cantidad > 0 && (
          <span className="absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-sm font-bold text-slate-900 shadow">
            {cantidad}
          </span>
        )}
      </button>
      <div className="p-4">
        <h3 className="min-h-10 text-sm font-semibold text-slate-900">{nombre}</h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-bold tracking-tight text-slate-900">{formatPrecio(precio)}</span>
          <div className="flex gap-2">
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
