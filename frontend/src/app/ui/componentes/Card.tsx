import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
 
// ── TIPOS ──────────────────────────────────────────────────────────────────────
/*
    colorIcono define el esquema de color del ícono.
    Cada valor mapea a un fondo + color de texto específico.
    Así cada card puede tener su propio color sin hardcodear estilos.
*/
type ColorIcono = "blue" | "green" | "purple" | "orange" | "red" | "gray";
 
type CardProps = {
    title:       string;
    content:     string | number;
    // icono es opcional — si no se pasa, la card se muestra sin ícono
    icono?:      ReactNode;
    colorIcono?: ColorIcono;
};
 
// ── MAPA DE COLORES ────────────────────────────────────────────────────────────
/*
    Record<ColorIcono, string> garantiza que cada color tiene sus estilos definidos.
    Si agregás un nuevo color al tipo, TypeScript te obliga a agregarlo acá también.
*/
const coloresIcono: Record<ColorIcono, string> = {
    blue:   "bg-blue-50   text-blue-500",
    green:  "bg-emerald-50 text-emerald-500",
    purple: "bg-purple-50  text-purple-500",
    orange: "bg-orange-50  text-orange-500",
    red:    "bg-red-50     text-red-500",
    gray:   "bg-gray-100   text-gray-500",
};
 
// ── COMPONENTE ─────────────────────────────────────────────────────────────────
const Card = ({ title, content, icono, colorIcono = "blue" }: CardProps) => {
    return (
        /*
            hover:shadow-md: sombra más pronunciada al hacer hover
            transition-shadow: anima el cambio de sombra suavemente
            gap-4: espacio entre el ícono y los datos
        */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
 
            {/* ── ÍCONO ─────────────────────────────────────────────────────── */}
            {/* Solo se renderiza si se pasó un ícono */}
            {icono && (
                /*
                    rounded-xl: esquinas redondeadas en el contenedor del ícono
                    p-3: padding interno para que el ícono no quede pegado al borde
                    flex-shrink-0: el ícono nunca se encoge aunque el texto sea largo
                */
                <div className={cn(
                    "rounded-xl p-3 flex items-center justify-center",
                    coloresIcono[colorIcono]
                )}>
                    {icono}
                </div>
            )}
 
            {/* ── DATOS ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col min-w-0">
                {/*
                    text-2xl font-bold: el número es el dato más importante,
                    tiene el mayor peso visual de la card
                    tabular-nums: los números se alinean correctamente
                    leading-none: sin espacio extra entre el número y el texto
                */}
                <span className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                    {content}
                </span>
                {/*
                    truncate: si el título es muy largo, se corta con "..."
                    en lugar de romper el layout de la card
                */}
                <span className="text-sm text-gray-500 mt-1 truncate">
                    {title}
                </span>
            </div>
 
        </div>
    );
};
 
export default Card;