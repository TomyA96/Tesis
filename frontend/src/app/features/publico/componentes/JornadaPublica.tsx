import { CalendarDays, ChevronDown, Clock, MapPin } from "lucide-react";
import { cn } from "../../../../lib/cn";
import EntradaDetalle from "./EntradaDetalle";
import type { JornadaConEntradas } from "../../../services/eventosService";
import { fechaCortaConDia, horaArgentina } from "../../../utils/zonaHoraria";

type JornadaPublicaProps = {
    jornada: JornadaConEntradas;
    titulo: string;
    abierta: boolean;
    onAlternar: () => void;
    cantidades: Record<number, number>;
    onCambiarCantidad: (idEntrada: number, cambio: number) => void;
};

/*
    Si la jornada se suspendió o se canceló, en vez de las entradas se le
    avisa a quien ya compró qué pasa con lo suyo.
*/
const avisos: Partial<Record<JornadaConEntradas["estado"], { etiqueta: string; estilo: string; texto: string }>> = {
    Suspendido: {
        etiqueta: "Suspendida",
        estilo: "bg-amber-100 text-amber-800",
        texto: "Esta fecha fue suspendida. Si ya tenés entradas, siguen siendo válidas para la nueva fecha.",
    },
    Cancelado: {
        etiqueta: "Cancelada",
        estilo: "bg-red-100 text-red-700",
        texto: "Esta fecha fue cancelada. Si compraste entradas, comunicate con la organización por el reembolso.",
    },
};

/*
    Una jornada del evento en el detalle público: una card que se despliega
    y muestra sus entradas para elegir. Arriba, lo que hace falta para ir:
    fecha, hora de inicio y dirección. Si no le queda nada para vender
    online, se ve como "Agotada" y no se despliega. Si está suspendida o
    cancelada, tampoco: muestra el aviso.
*/
const JornadaPublica = ({ jornada, titulo, abierta, onAlternar, cantidades, onCambiarCantidad }: JornadaPublicaProps) => {
    const aviso = avisos[jornada.estado];
    const agotada = jornada.entradas.length === 0;
    const elegidas = jornada.entradas.reduce((suma, e) => suma + (cantidades[e.id] ?? 0), 0);
    const desplegada = abierta && !agotada;

    return (
        <article className={cn("rounded-2xl border bg-white transition-shadow", desplegada ? "border-marca/40 shadow-sm" : "border-gray-200")}>
            <button
                type="button"
                onClick={onAlternar}
                disabled={agotada}
                aria-expanded={desplegada}
                className="flex w-full cursor-pointer items-start gap-3 p-4 text-left disabled:cursor-default"
            >
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className={cn("text-lg font-semibold", agotada ? "text-gray-400" : "text-noche")}>{titulo}</h3>
                        {aviso ? (
                            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", aviso.estilo)}>
                                {aviso.etiqueta}
                            </span>
                        ) : agotada && (
                            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Agotada
                            </span>
                        )}
                        {elegidas > 0 && (
                            <span className="rounded-full bg-sol/20 px-2.5 py-0.5 text-xs font-semibold text-noche">
                                {elegidas} elegida{elegidas === 1 ? "" : "s"}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-marca" />
                            {fechaCortaConDia(jornada.fechaHoraInicio)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-marca" />
                            {horaArgentina(jornada.fechaHoraInicio)}
                        </span>
                        <span className="flex min-w-0 items-center gap-1.5">
                            <MapPin className="h-4 w-4 shrink-0 text-marca" />
                            <span className="truncate">{jornada.direccion}</span>
                        </span>
                    </div>
                    {aviso && <p className="text-sm text-gray-600">{aviso.texto}</p>}
                </div>
                {!agotada && (
                    <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform", desplegada && "rotate-180")} />
                )}
            </button>

            {desplegada && (
                <div className="flex flex-col gap-3 border-t border-gray-100 p-4">
                    {jornada.entradas.map((entrada) => (
                        <EntradaDetalle
                            key={entrada.id}
                            entrada={entrada}
                            cantidad={cantidades[entrada.id] ?? 0}
                            onCambiarCantidad={(cambio) => onCambiarCantidad(entrada.id, cambio)}
                        />
                    ))}
                </div>
            )}
        </article>
    );
};

export default JornadaPublica;
