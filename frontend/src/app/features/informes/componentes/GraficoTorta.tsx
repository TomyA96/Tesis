type Porcion = { clave: string | number; nombre: string; valor: number; color?: string };

type GraficoTortaProps = {
    partes: Porcion[];
    formato: (valor: number) => string;
    vacio?: string;
    // Hasta qué tamaño puede crecer la torta (un largo de CSS)
    maximo?: string;
};

/*
    Colores en orden fijo (validados también para daltonismo): la primera
    porción siempre es azul, la segunda ámbar, etc. Si hay más porciones que
    colores, las más chicas se juntan en "Otros".
*/
const PALETA = ["#2563EB", "#D97706", "#0D9488", "#7C3AED", "#DB2777", "#65A30D"];
const OTROS = "#94A3B8";

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

/*
    Torta para repartir un total en pocas partes. Se dibuja con un
    conic-gradient (sin librerías), con una línea blanca entre porciones para
    distinguirlas sin bordes. Al lado, cada parte con su monto y su %: el
    color solo no alcanza para identificarla.

    El tamaño no es fijo: crece con el espacio de la tarjeta hasta `maximo`.
    La leyenda tiene un ancho máximo para que cada monto quede cerca de su
    nombre, y el conjunto va centrado.
*/
const GraficoTorta = ({ partes, formato, vacio = "Sin datos para mostrar", maximo = "14rem" }: GraficoTortaProps) => {
    const ordenadas = partes.filter((p) => p.valor > 0).sort((a, b) => b.valor - a.valor);
    if (ordenadas.length === 0) return <p className="py-6 text-center text-sm text-slate-400">{vacio}</p>;

    const visibles = ordenadas.length > PALETA.length ? ordenadas.slice(0, PALETA.length - 1) : ordenadas;
    const resto = ordenadas.slice(visibles.length);
    // Las que traen color propio lo conservan (ej: Entradas y Buffet, iguales en todo el sistema); las demás toman los que quedan libres
    const usados = new Set(visibles.map((p) => p.color).filter(Boolean));
    const libres = PALETA.filter((c) => !usados.has(c));
    let siguiente = 0;
    const porciones = [
        ...visibles.map((p) => ({ ...p, color: p.color ?? libres[siguiente++] ?? OTROS })),
        ...(resto.length > 0 ? [{ clave: "otros", nombre: `Otros (${resto.length})`, valor: resto.reduce((s, p) => s + p.valor, 0), color: OTROS }] : []),
    ];
    const total = porciones.reduce((suma, p) => suma + p.valor, 0);

    // Cada porción termina un poco antes y ese hueco va en blanco: la separación entre porciones
    const separacion = porciones.length > 1 ? 0.4 : 0;
    let acumulado = 0;
    const gradiente = porciones
        .map((p) => {
            const desde = (acumulado / total) * 100;
            acumulado += p.valor;
            const hasta = (acumulado / total) * 100;
            return `${p.color} ${desde}% ${Math.max(hasta - separacion, desde)}%, #ffffff ${Math.max(hasta - separacion, desde)}% ${hasta}%`;
        })
        .join(", ");

    return (
        // Si la tarjeta es angosta, la leyenda pasa debajo de la torta en vez de apretarse al costado
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            <div className="min-w-[9rem] flex-1" style={{ maxWidth: maximo }}>
                <div
                    className="aspect-square w-full rounded-full"
                    style={{ background: `conic-gradient(${gradiente})` }}
                    role="img"
                    aria-label={porciones.map((p) => `${p.nombre}: ${formato(p.valor)}`).join(", ")}
                />
            </div>
            <ul className="flex w-full max-w-xs flex-col gap-2.5 sm:w-auto sm:min-w-[15rem]">
                {porciones.map((p) => (
                    <li key={p.clave} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: p.color }} />
                        <span className="min-w-0 flex-1 truncate text-slate-700" title={p.nombre}>{p.nombre}</span>
                        <span className="font-semibold tabular-nums text-slate-800">{formato(p.valor)}</span>
                        <span className="w-12 text-right text-xs tabular-nums text-slate-400">{formatoPorcentaje((p.valor / total) * 100)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GraficoTorta;
