import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import { API_URL } from "../../../services/api";
import type { EventoConImagenes } from "../../../services/eventosService";
import { fechasDelEvento } from "../fechasEvento";

type EventoCardPublicaProps = {
    evento: EventoConImagenes;
};

/*
    Si no le queda ninguna fecha activa, la card lo avisa: quien compró se
    entera desde el listado. Con alguna activa no hace falta, cada fecha
    muestra su estado en el detalle.
*/
const avisoDelEvento = (jornadas: EventoConImagenes["jornadas"]) => {
    if (jornadas.length === 0 || jornadas.some((j) => j.estado === "Activo")) return null;
    return jornadas.every((j) => j.estado === "Cancelado")
        ? { texto: "Cancelado", estilo: "bg-red-100 text-red-700" }
        : { texto: "Suspendido", estilo: "bg-amber-100 text-amber-800" };
};

const EventoCardPublica = ({ evento }: EventoCardPublicaProps) => {
    const imagen = evento.imagenes[0];
    const aviso = avisoDelEvento(evento.jornadas);

    return (
        <Link to={RUTAS.publico.detalle(evento.id)} className="group block">
        <article className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-marca/40 transition">
            {imagen && (
                <img
                    src={`${API_URL}${imagen.url}`}
                    alt={evento.nombre}
                    className="w-full h-48 object-cover"
                />
            )}

            <div className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-noche group-hover:text-marca transition-colors">{evento.nombre}</h3>
                    {aviso && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${aviso.estilo}`}>
                            {aviso.texto}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 text-marca" />
                    <span>{fechasDelEvento(evento.jornadas)}</span>
                </div>
                {evento.jornadas.length > 1 && (
                    <span className="text-xs text-gray-500">{evento.jornadas.length} eventos</span>
                )}
            </div>
        </article>
        </Link>
    );
};

export default EventoCardPublica;
