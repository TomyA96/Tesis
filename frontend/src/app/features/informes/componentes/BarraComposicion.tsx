type Parte = { nombre: string; valor: number; color: string };

type BarraComposicionProps = {
    partes: Parte[];
    formato: (valor: number) => string;
};

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 0 })}%`;

/*
    Una sola barra partida en tramos que suman el 100%: de qué está hecho un
    total (por ejemplo, lo recaudado). Mide lo mismo con 3 eventos que con 50.
    Debajo, cada parte con su color, su monto y su porcentaje: el color solo no alcanza.
*/
const BarraComposicion = ({ partes, formato }: BarraComposicionProps) => {
    const total = partes.reduce((suma, p) => suma + p.valor, 0);
    const visibles = partes.filter((p) => p.valor > 0);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded bg-slate-100">
                {visibles.map((parte) => (
                    <div
                        key={parte.nombre}
                        className="h-full"
                        style={{ flexGrow: parte.valor, backgroundColor: parte.color }}
                        title={`${parte.nombre}: ${formato(parte.valor)}`}
                    />
                ))}
            </div>
            <ul className="flex flex-col gap-1 text-xs">
                {partes.map((parte) => (
                    <li key={parte.nombre} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: parte.color }} />
                        <span className="text-slate-600">{parte.nombre}</span>
                        <span className="ml-auto font-semibold tabular-nums text-slate-700">{formato(parte.valor)}</span>
                        <span className="w-9 text-right tabular-nums text-slate-400">
                            {total === 0 ? "—" : formatoPorcentaje((parte.valor / total) * 100)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BarraComposicion;
