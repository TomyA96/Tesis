type FilaOcupacion = {
    clave: string | number;
    label: string;
    // null: todavía no se realizó (no hay ocupación que medir)
    porcentaje: number | null;
    detalle: string;
};

type BarrasOcupacionProps = {
    data: FilaOcupacion[];
};

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

/*
    Una barra por fila que va de 0 a 100% (la capacidad): se compara contra el
    lugar que había, no contra las otras filas. El fondo gris es lo que quedó vacío.
*/
const BarrasOcupacion = ({ data }: BarrasOcupacionProps) => (
    <div className="flex flex-col gap-3">
        {data.map((fila) => (
            <div key={fila.clave} className="grid grid-cols-[minmax(0,9rem)_1fr_3.5rem_5.5rem] items-center gap-3">
                <p className="truncate text-sm font-medium text-slate-700">{fila.label}</p>
                {fila.porcentaje === null ? (
                    <span className="col-span-3 text-xs text-slate-400">Todavía no se realizó</span>
                ) : (
                    <>
                        <div className="h-2.5 rounded-r bg-slate-100">
                            <div className="h-full rounded-r bg-blue-600" style={{ width: `${Math.min(fila.porcentaje, 100)}%` }} />
                        </div>
                        <span className="text-right text-xs font-semibold tabular-nums text-slate-700">{formatoPorcentaje(fila.porcentaje)}</span>
                        <span className="text-right text-xs tabular-nums text-slate-400">{fila.detalle}</span>
                    </>
                )}
            </div>
        ))}
    </div>
);

export default BarrasOcupacion;
