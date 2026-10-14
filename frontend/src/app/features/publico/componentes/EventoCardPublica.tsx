import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import { API_URL } from "../../../services/api";
import type { EventoConImagenes } from "../../../services/eventosService";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";

type EventoCardPublicaProps = {
    evento: EventoConImagenes;
};

const EventoCardPublica = ({ evento }: EventoCardPublicaProps) => {
    const imagen = evento.imagenes[0];

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
                <h3 className="text-lg font-semibold text-noche group-hover:text-marca transition-colors">{evento.nombre}</h3>

                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 text-marca" />
                    <span>{fechaArgentina(evento.fechaHoraInicio)}</span>
                    <span>{horaArgentina(evento.fechaHoraInicio)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-marca" />
                    <span>{evento.ubicacion}</span>
                </div>
            </div>
        </article>
        </Link>
    );
};

export default EventoCardPublica;
