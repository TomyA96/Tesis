import Leyenda from "./Leyenda";

type Serie = { nombre: string; color: string };

type ColumnaApilada = {
    clave: string | number;
    label: string;
    // Un valor por serie, en el mismo orden que `series`; la primera va abajo
    valores: number[];
};

type ColumnasApiladasProps = {
    series: Serie[];
    data: ColumnaApilada[];
    formato: (valor: number) => string;
};

/*
    Columnas verticales partidas en tramos, para algo que avanza en el
    tiempo (las horas de una noche): la altura es el total de cada momento y
    los tramos muestran cómo se repartió. Al pasar el mouse, el detalle.
*/
const ColumnasApiladas = ({ series, data, formato }: ColumnasApiladasProps) => {
    const total = (c: ColumnaApilada) => c.valores.reduce((suma, v) => suma + v, 0);
    const max = Math.max(...data.map(total), 0);

    return (
        <div>
            <Leyenda series={series} />
            <div className="flex h-52 items-end gap-2 border-b border-slate-200 px-1">
                {data.map((columna) => {
                    const suma = total(columna);
                    return (
                        <div
                            key={columna.clave}
                            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                            title={`${columna.label}: ${formato(suma)}\n${series.map((s, i) => `${s.nombre}: ${formato(columna.valores[i])}`).join("\n")}`}
                        >
                            <div className="flex w-full max-w-10 flex-col-reverse gap-0.5" style={{ height: `${max === 0 ? 0 : (suma / max) * 100}%` }}>
                                {series.map((serie, i) =>
                                    columna.valores[i] > 0 ? (
                                        <div key={serie.nombre} className="w-full last:rounded-t" style={{ flexGrow: columna.valores[i], backgroundColor: serie.color }} />
                                    ) : null,
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex gap-2 px-1">
                {data.map((columna) => (
                    <span key={columna.clave} className="min-w-0 flex-1 text-center text-xs text-slate-500">
                        {columna.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ColumnasApiladas;
