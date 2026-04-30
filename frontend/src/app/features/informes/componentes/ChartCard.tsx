type ChartCardProps = {
  titulo: string;
  subtitulo?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

const ChartCard = ({ titulo, subtitulo, action, children }: ChartCardProps) => {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
            {titulo}
          </h3>
          {subtitulo && (
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{subtitulo}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
};

export default ChartCard;
