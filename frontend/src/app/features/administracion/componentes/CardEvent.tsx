// ═══════════════════════════════════════════════════════════════════════════════
// CardEvent.tsx
// ═══════════════════════════════════════════════════════════════════════════════
import { CalendarDays } from "lucide-react";
import type { EstadoEvento } from "../../../services/eventosService";
import Etiqueta, { type ColorEtiqueta } from "../../../ui/componentes/Etiqueta";
import { coloresEstadoEvento } from "../../eventos/eventos.columns";

type EventProps = {
    nombre: string;
    fecha: string;
    estado: EstadoEvento;
    // Botones del pie de la card: los arma quien tiene los datos que necesitan
    acciones: React.ReactNode;
};
 
// Franja superior: se indexa por el color de la Etiqueta, no por el estado,
// así franja y etiqueta nunca pueden quedar con colores distintos.
const colorFranja: Record<ColorEtiqueta, string> = {
    verde:  "bg-emerald-500",
    rojo:   "bg-rose-500",
    ambar:  "bg-amber-400",
    gris:   "bg-gray-400",
    azul:   "bg-blue-500",
    indigo: "bg-indigo-500",
};
 
const CardEvent = ({ nombre, fecha, estado, acciones }: EventProps) => {

    return (
        /*
            Sin alto fijo: la card mide lo que mide su contenido, y flex ya
            iguala la altura de todas las de una misma fila.
            basis + grow + max-w: arrancan en 360px y se estiran para llenar
            el ancho sobrante de la fila (menos aire a los costados), pero sin
            desbordarse cuando queda una sola card en la última fila.
        */
        <div className="flex flex-col basis-[360px] grow max-w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
            {/* ── FRANJA SUPERIOR DE COLOR ──────────────────────────────────────
                Comunica visualmente el estado sin necesidad de leer la etiqueta.
            */}
            <div className={`h-1.5 w-full ${colorFranja[coloresEstadoEvento[estado]]}`} />

            {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────── */}
            <div className="flex flex-col flex-1 p-4 gap-2">
 
                {/* Nombre + Badge en la misma fila */}
                <div className="flex items-start justify-between gap-2">
                    {/*
                        h3 en lugar de h1 — es un subtítulo dentro de una card,
                        no el título principal de la página
                        line-clamp-2: si el nombre es muy largo, corta en 2 líneas
                    */}
                    <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                        {nombre}
                    </h3>
                    <Etiqueta color={coloresEstadoEvento[estado]}>{estado}</Etiqueta>
                </div>
 
                {/* Fecha con ícono */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{fecha}</span>
                </div>
 
                {/* ── ACCIONES ──────────────────────────────────────────────────
                    mt-auto empuja los botones al fondo de la card,
                    sin importar cuánto contenido haya arriba.
                    Así todas las cards tienen los botones alineados al mismo nivel.
                */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                    {acciones}
                </div>
 
            </div>
        </div>
    );
};
 
export default CardEvent;