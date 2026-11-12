import { Link } from "react-router-dom";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import { cn } from "../../../../lib/cn";
import { coloresEstadoEvento } from "../eventos.columns";
import { fechaCortaConDia, horaArgentina } from "../../../utils/zonaHoraria";
import type { Jornada } from "../../../services/jornadasService";
import type { EstadoEvento } from "../../../services/eventosService";

// La franja superior repite el color de la etiqueta de estado: se reconoce de un vistazo
const franjaEstado: Record<EstadoEvento, string> = {
    Activo: "border-t-emerald-500",
    Borrador: "border-t-indigo-400",
    Finalizado: "border-t-blue-500",
    Suspendido: "border-t-amber-500",
    Cancelado: "border-t-rose-500",
};

type TarjetaJornadaProps = {
    jornada: Jornada;
    // El nombre a mostrar (el propio o "Jornada N"): lo calcula la página, que conoce el orden
    titulo: string;
    // A dónde lleva al hacer clic: la pantalla de la jornada
    to: string;
    // Solo para jornadas en Borrador: lo que les falta para publicarse (vacío = lista)
    faltantes?: string[];
    // Para pegarle algo debajo (el resumen de sus lotes) sin que queden las esquinas redondeadas
    className?: string;
};

/*
    Resumen de una jornada en el detalle del evento. Es un Link (un <a> real),
    no un botón: lleva a otra pantalla, así que abrir en pestaña nueva o
    copiar el enlace funcionan como se espera.
*/
const TarjetaJornada = ({ jornada, titulo, to, faltantes, className }: TarjetaJornadaProps) => {
    return (
        <Link
            to={to}
            className={cn(
                "flex flex-col gap-1.5 rounded-lg border border-t-4 border-gray-200 bg-white p-4 text-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                franjaEstado[jornada.estado],
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-gray-800">{titulo}</span>
                <Etiqueta color={coloresEstadoEvento[jornada.estado]}>{jornada.estado}</Etiqueta>
            </div>

            <span className="text-gray-700">
                {fechaCortaConDia(jornada.fechaHoraInicio)} · {horaArgentina(jornada.fechaHoraInicio)} a{" "}
                {horaArgentina(jornada.fechaHoraFin)}
            </span>
            <span className="truncate text-gray-500" title={jornada.direccion}>
                {jornada.direccion}
            </span>
            <span className="text-gray-500">Capacidad: {jornada.capacidad}</span>

            {faltantes &&
                (faltantes.length > 0 ? (
                    <ul className="mt-1 flex flex-col gap-0.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <li className="font-medium">Para publicarla falta:</li>
                        {faltantes.map((faltante) => (
                            <li key={faltante}>• {faltante}</li>
                        ))}
                    </ul>
                ) : (
                    <span className="mt-1 text-xs font-medium text-emerald-700">Lista para publicar</span>
                ))}
        </Link>
    );
};

export default TarjetaJornada;
