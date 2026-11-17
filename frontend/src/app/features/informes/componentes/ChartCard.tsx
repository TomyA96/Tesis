import { cn } from "../../../../lib/cn";

type ChartCardProps = {
  titulo: string;
  subtitulo?: string;
  action?: React.ReactNode;
  // Centra el gráfico en vertical: para los de tamaño propio (anillo, torta) cuando la grilla estira la tarjeta
  centrado?: boolean;
  children: React.ReactNode;
};

/*
    Tarjeta de un gráfico. En una grilla, todas las tarjetas de la misma fila
    toman la altura de la más alta: por eso el cuerpo ocupa todo el alto que
    le queda (flex-1), y con `centrado` el gráfico se ubica en el medio en vez
    de quedar pegado arriba con un hueco abajo.
*/
const ChartCard = ({ titulo, subtitulo, action, centrado = false, children }: ChartCardProps) => {
  return (
    <section className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
      <div className={cn("flex-1 p-5", centrado && "flex flex-col justify-center")}>{children}</div>
    </section>
  );
};

export default ChartCard;
