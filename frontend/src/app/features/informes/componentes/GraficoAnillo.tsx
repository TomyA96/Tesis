type Parte = { nombre: string; valor: number; color: string; detalle?: string };

type GraficoAnilloProps = {
    partes: Parte[];
    centroLabel: string;
    centroValor: string;
    formato?: (valor: number) => string;
    // Hasta qué tamaño puede crecer el anillo (un largo de CSS)
    maximo?: string;
};

/*
    Anillo para una parte de un todo con pocas partes (2 o 3), como la
    ocupación: el número del centro es lo que importa y el anillo lo muestra
    de un vistazo. Al lado, cada parte con su valor: el color solo no alcanza.
    Se dibuja con un conic-gradient, sin librerías.

    El tamaño no es fijo: crece con el espacio de la tarjeta hasta `maximo`.
    La leyenda tiene un ancho máximo para que cada número quede cerca de su
    nombre, y el conjunto va centrado.
*/
const GraficoAnillo = ({ partes, centroLabel, centroValor, formato = (v) => v.toLocaleString("es-AR"), maximo = "16rem" }: GraficoAnilloProps) => {
    const total = partes.reduce((suma, p) => suma + p.valor, 0);
    let acumulado = 0;
    const gradiente =
        total === 0
            ? "#E2E8F0 0% 100%"
            : partes
                  .map((p) => {
                      const desde = (acumulado / total) * 100;
                      acumulado += p.valor;
                      return `${p.color} ${desde}% ${(acumulado / total) * 100}%`;
                  })
                  .join(", ");

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            <div className="min-w-[10rem] flex-1" style={{ maxWidth: maximo }}>
                <div className="flex aspect-square w-full items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradiente})` }}>
                    {/* El agujero es proporcional al anillo, así el grosor se mantiene al crecer */}
                    <div className="flex h-[64%] w-[64%] flex-col items-center justify-center rounded-full bg-white text-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{centroLabel}</span>
                        <span className="mt-1 text-3xl font-bold text-slate-900">{centroValor}</span>
                    </div>
                </div>
            </div>
            <ul className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:min-w-[14rem]">
                {partes.map((p) => (
                    <li key={p.nombre} className="flex items-start gap-2">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: p.color }} />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700">{p.nombre}</p>
                            {p.detalle && <p className="text-xs text-slate-400">{p.detalle}</p>}
                        </div>
                        <span className="pl-4 text-sm font-semibold tabular-nums text-slate-800">{formato(p.valor)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GraficoAnillo;
