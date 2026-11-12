import { CalendarDays, Clock, ScanLine, Ticket, UtensilsCrossed, type LucideIcon } from "lucide-react";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import type { AccionOperacion } from "../operaciones.config";
import type { MomentoJornada } from "../utils/ventanaOperacion";

type CardJornadaOperacionProps = {
    idJornada: number;
    nombreEvento: string;
    nombreJornada: string;
    // Imagen del evento; sin ella (o si no carga) se muestra un fondo liso
    imagenUrl?: string;
    fecha: string;
    horario: string;
    momento: MomentoJornada;
    // Solo las que el usuario tiene permiso de hacer
    acciones: AccionOperacion[];
};

const iconoDeAccion: Record<AccionOperacion["clave"], LucideIcon> = {
    accesos: ScanLine,
    ventaEntradas: Ticket,
    buffet: UtensilsCrossed,
};

const textoMomento: Record<MomentoJornada, { texto: string; clase: string }> = {
    "en-curso": { texto: "En curso", clase: "bg-emerald-500 text-white" },
    "por-comenzar": { texto: "Por comenzar", clase: "bg-amber-400 text-amber-950" },
    "en-cierre": { texto: "En cierre", clase: "bg-gray-200 text-gray-700" },
};

/*
    La imagen es del evento, no de la jornada: dos cards del mismo festival
    llevan la misma foto. Por eso lo que las distingue (el nombre de la
    jornada, la fecha y el momento) va bien grande. La imagen queda como banda
    superior y los botones sobre fondo liso: sobre una foto se leerían mal.
*/
const CardJornadaOperacion = ({
    idJornada,
    nombreEvento,
    nombreJornada,
    imagenUrl,
    fecha,
    horario,
    momento,
    acciones,
}: CardJornadaOperacionProps) => {
    const estadoMomento = textoMomento[momento];

    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
            {/* ── BANDA CON LA IMAGEN ───────────────────────────────────── */}
            <div className="relative h-48 bg-gradient-to-br from-slate-800 to-blue-900">
                {imagenUrl && (
                    <img src={imagenUrl} alt={nombreEvento} className="absolute inset-0 h-full w-full object-cover" />
                )}
                {/* Degradado oscuro abajo: asegura que el título se lea sobre cualquier foto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${estadoMomento.clase}`}>
                    {estadoMomento.texto}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h2 className="line-clamp-2 text-xl font-bold leading-tight">{nombreEvento}</h2>
                    <p className="text-sm font-medium text-white/85">{nombreJornada}</p>
                </div>
            </div>

            {/* ── DATOS Y BOTONES, SOBRE FONDO LISO ─────────────────────── */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        {fecha}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {horario}
                    </span>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                    {acciones.map((accion) => {
                        const Icono = iconoDeAccion[accion.clave];
                        return (
                            <LinkBtn
                                key={accion.clave}
                                variant="primary"
                                size="lg"
                                className="w-full gap-2 py-4"
                                to={accion.ruta(idJornada)}
                            >
                                <Icono className="h-5 w-5" />
                                {accion.etiqueta}
                            </LinkBtn>
                        );
                    })}
                </div>
            </div>
        </article>
    );
};

export default CardJornadaOperacion;
