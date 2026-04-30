type EventoItem = {
  nombre: string;
  fecha?: string;
  estado?: string;
};

type PanelEventosInformeProps = {
  titulo: string;
  eventos: EventoItem[];
};

const PanelEventosInforme = ({ titulo, eventos }: PanelEventosInformeProps) => {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
          {titulo}
        </h3>
      </div>
      <div className="p-2">
        {eventos.map((evento, index) => (
          <div
            key={`${evento.nombre}-${index}`}
            className="rounded-xl px-3 py-3 border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{evento.nombre}</p>
                {(evento.fecha || evento.estado) && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {evento.fecha && <span>{evento.fecha}</span>}
                    {evento.estado && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {evento.estado}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PanelEventosInforme;
