type ItemRanking = {
    clave: string | number;
    label: string;
    valor: number;
    // Un dato de apoyo debajo del nombre (ej: "120 vendidas")
    detalle?: string;
};

type BarrasRankingProps = {
    data: ItemRanking[];
    formato: (valor: number) => string;
    color?: string;
    vacio?: string;
};

/*
    Ranking de una sola serie: una barra horizontal por ítem, de mayor a menor.
    Sirve para comparar partes de un mismo total (canales de venta, rubros de
    gasto, productos): leer largos es más preciso que leer porciones de torta.
*/
const BarrasRanking = ({ data, formato, color = "#2563EB", vacio = "Sin datos para mostrar" }: BarrasRankingProps) => {
    if (data.length === 0) return <p className="py-6 text-center text-sm text-slate-400">{vacio}</p>;

    const ordenados = [...data].sort((a, b) => b.valor - a.valor);
    const max = Math.max(...ordenados.map((d) => d.valor), 0);

    return (
        <div className="flex flex-col gap-3">
            {ordenados.map((item) => (
                <div key={item.clave} className="grid grid-cols-[minmax(0,10rem)_1fr_6.5rem] items-center gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700" title={item.label}>{item.label}</p>
                        {item.detalle && <p className="truncate text-xs text-slate-400">{item.detalle}</p>}
                    </div>
                    <div className="h-2.5">
                        <div className="h-full rounded-r" style={{ width: `${max === 0 ? 0 : (item.valor / max) * 100}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-right text-xs font-semibold tabular-nums text-slate-700">{formato(item.valor)}</span>
                </div>
            ))}
        </div>
    );
};

export default BarrasRanking;
