import Btn from "../../../ui/componentes/Btn";
import { Minus, Plus } from "lucide-react";

type ProductoVentaCardProps = {
  nombre: string;
  precio: string;
  descripcion: string;
  color: string;
};

const ProductoVentaCard = ({
  nombre,
  precio,
  descripcion,
  color,
}: ProductoVentaCardProps) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`h-28 bg-gradient-to-br ${color} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_40%)]" />
        <div className="absolute bottom-4 left-4 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          Producto
        </div>
      </div>
      <div className="p-4">
        <div className="min-h-[68px]">
          <h3 className="text-sm font-semibold text-slate-900">{nombre}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{descripcion}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-bold tracking-tight text-slate-900">{precio}</span>
          <div className="flex gap-2">
            <Btn variant="outline" size="icon" className="rounded-full">
              <Minus className="h-4 w-4" />
            </Btn>
            <Btn size="icon" className="rounded-full">
              <Plus className="h-4 w-4" />
            </Btn>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductoVentaCard;
