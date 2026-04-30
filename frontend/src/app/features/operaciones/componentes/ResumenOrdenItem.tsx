type ResumenOrdenItemProps = {
  producto: string;
  cantidad: number;
  precioUnitario: string;
  total: string;
};

const ResumenOrdenItem = ({
  producto,
  cantidad,
  precioUnitario,
  total,
}: ResumenOrdenItemProps) => {
  return (
    <div className="grid grid-cols-[1.3fr_64px_88px_88px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{producto}</p>
        <p className="text-xs text-slate-400">Precio unitario</p>
      </div>
      <span className="text-sm font-semibold text-slate-700 text-center">{cantidad}</span>
      <span className="text-sm text-slate-500 text-right">{precioUnitario}</span>
      <span className="text-sm font-semibold text-slate-900 text-right">{total}</span>
    </div>
  );
};

export default ResumenOrdenItem;
