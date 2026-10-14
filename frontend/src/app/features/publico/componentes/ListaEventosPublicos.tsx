import type { EventoConImagenes } from "../../../services/eventosService";
import EventoCardPublica from "./EventoCardPublica";

type ListaEventosPublicosProps = {
    eventos: EventoConImagenes[];
};

const ListaEventosPublicos = ({ eventos }: ListaEventosPublicosProps) => {
    // Si no hay eventos no se renderiza nada: el carrusel de arriba ya
    // muestra el mensaje de "no hay eventos publicados", no hace falta repetirlo.
    if (eventos.length === 0) {
        return null;
    }

    return (
        <section className="px-8 py-10">
            <h2 className="text-2xl font-bold text-noche mb-6 pl-3 border-l-4 border-sol">Próximos eventos</h2>

            {/* Grilla responsive: 1 columna en mobile, 2 en tablet, 3 en desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((evento) => (
                    <EventoCardPublica key={evento.id} evento={evento} />
                ))}
            </div>
        </section>
    );
};

export default ListaEventosPublicos;
