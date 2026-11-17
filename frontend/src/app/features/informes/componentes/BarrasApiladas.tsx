import Leyenda from "./Leyenda";

type Serie = { nombre: string; color: string };

type FilaApilada = {
    clave: string | number;
    label: string;
    // Un valor por serie, en el mismo orden que `series`
    valores: number[];
};

type BarrasApiladasProps = {
    series: Serie[];
    data: FilaApilada[];
    formato: (valor: number) => string;
};

/*
    Una barra por fila partida en tramos: el largo total es lo que suma la
    fila y cada tramo cuánto aportó cada parte (por ejemplo, entradas y
    buffet de cada jornada). Entre tramos queda un espacio para distinguirlos
    sin bordes. Al pasar el mouse se ve el detalle de cada parte.
*/
const BarrasApiladas = ({ series, data, formato }: BarrasApiladasProps) => {
    const total = (fila: FilaApilada) => fila.valores.reduce((suma, v) => suma + v, 0);
    const max = Math.max(...data.map(total), 0);

    return (
        <div>
            <Leyenda series={series} />
            <div className="flex flex-col gap-3">
                {data.map((fila) => {
                    const suma = total(fila);
                    return (
                        <div
                            key={fila.clave}
                            className="grid grid-cols-[minmax(0,9rem)_1fr_6.5rem] items-center gap-3"
                            title={`${fila.label}\n${series.map((s, i) => `${s.nombre}: ${formato(fila.valores[i])}`).join("\n")}`}
                        >
                            <p className="truncate text-sm font-medium text-slate-700">{fila.label}</p>
                            <div className="flex h-3 gap-0.5" style={{ width: `${max === 0 ? 0 : (suma / max) * 100}%` }}>
                                {series.map((serie, i) =>
                                    fila.valores[i] > 0 ? (
                                        <div key={serie.nombre} className="h-full last:rounded-r" style={{ flexGrow: fila.valores[i], backgroundColor: serie.color }} />
                                    ) : null,
                                )}
                            </div>
                            <span className="text-right text-xs font-semibold tabular-nums text-slate-700">{formato(suma)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BarrasApiladas;
