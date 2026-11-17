type LeyendaProps = {
    series: { nombre: string; color: string }[];
};

// Qué representa cada color de un gráfico con más de una serie (el color solo no alcanza)
const Leyenda = ({ series }: LeyendaProps) => (
    <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        {series.map((s) => (
            <span key={s.nombre} className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.nombre}
            </span>
        ))}
    </div>
);

export default Leyenda;
