type KpiBoxProps = {
  titulo: string;
  valor: string;
  descripcion?: string;
  badge?: string;
  color?: "default" | "success" | "warning" | "danger";
};

const estilos = {
  default: "from-blue-50 to-white text-blue-700 ring-blue-100",
  success: "from-emerald-50 to-white text-emerald-700 ring-emerald-100",
  warning: "from-amber-50 to-white text-amber-700 ring-amber-100",
  danger: "from-rose-50 to-white text-rose-700 ring-rose-100",
};

const KpiBox = ({
  titulo,
  valor,
  descripcion,
  badge,
  color = "default",
}: KpiBoxProps) => {
  return (
    <article className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${estilos[color]} shadow-sm ring-1 p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {titulo}
        </p>
        {badge && (
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{valor}</p>
      {descripcion && <p className="mt-2 text-sm text-slate-500 leading-relaxed">{descripcion}</p>}
    </article>
  );
};

export default KpiBox;
