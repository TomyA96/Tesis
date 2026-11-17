import { formatPrecio } from "../../../utils/formatoPrecio";

type ResumenOrdenItemProps = {
  producto: string;
  cantidad: number;
  precioUnitario: number;
};

// Un renglón de la venta en curso: el total se calcula acá, con el precio del catálogo
const ResumenOrdenItem = ({ producto, cantidad, precioUnitario }: ResumenOrdenItemProps) => {
  return (
    <div className="grid grid-cols-[1.3fr_48px_88px_88px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="text-sm font-semibold text-slate-800">{producto}</p>
      <span className="text-center text-sm font-semibold text-slate-700">{cantidad}</span>
      <span className="text-right text-sm text-slate-500">{formatPrecio(precioUnitario)}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{formatPrecio(precioUnitario * cantidad)}</span>
    </div>
  );
};

export default ResumenOrdenItem;
