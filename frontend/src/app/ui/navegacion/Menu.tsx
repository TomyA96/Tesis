import Opcion from "./Opcion";
import { cn } from "../../../lib/cn";
import { NavLink } from "react-router-dom";

type MenuProps = {
    area: string;
    // El ícono es un componente SVG de Lucide React — se lo pasás desde Sidebar
    
    icono: React.ReactNode;
    opciones: { label: string; href: string }[];
    isOpen: boolean;
    onToggle: () => void;
    href: string; // Agregado para manejar rutas en Opcion
};

const Menu = ({ area, icono, opciones, isOpen, onToggle, href }: MenuProps) => {
    return (
        <li className="w-full">

            {/* ── BOTÓN PRINCIPAL DE LA SECCIÓN ────────────────────────────── */}
            
                <NavLink
                    onClick={onToggle}
                    to={href}
                    className={cn("w-full flex items-center gap-3 px-4 py-2.5 mx-0",
                        "text-sm font-semibold transition-colors duration-150 cursor-pointer",
                        isOpen
                            // Sección abierta: texto más claro para indicar estado activo
                            ? "text-white bg-white/5"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"   
                    )}>
                    {/* Ícono de la sección */}
                    <span className=" opacity-70">{icono}</span>

                    {/* Nombre de la sección */}
                    <span className="flex-1 text-left">{area}</span>

                    {/* ── CHEVRON ANIMADO ──────────────────────────────────────────
                        rotate-180 gira la flecha cuando isOpen es true.
                        transition-transform anima la rotación suavemente.
                        Así el usuario sabe visualmente que el menú se abrió/cerró. */}
                    <svg
                        className={cn("w-4 h-4 opacity-50 transition-transform duration-200",isOpen ? "rotate-180" : "")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </NavLink>
            

            {/* ── SUBMENÚ ──────────────────────────────────────────────────── */}
            {/* 
                grid grid-rows-[0fr] / grid-rows-[1fr] es la forma moderna de animar
                altura de 0 a auto en CSS puro con Tailwind.
                overflow-hidden evita que el contenido se vea mientras colapsa.
            */}
            <div className={cn("grid transition-all duration-200 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                    {/* Línea vertical izquierda — conecta visualmente las opciones con su sección */}
                    <ul className="py-1 ml-4 border-l border-white/10">
                        {opciones.map((opcion, index) => (
                            <Opcion
                                key={index}
                                label={opcion.label}
                                href={opcion.href}
                            />
                        ))}
                    </ul>
                </div>
            </div>

        </li>
    );
};

export default Menu;