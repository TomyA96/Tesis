import Opcion from "./Opcion";
import { cn } from "../../../lib/cn";
import { NavLink } from "react-router-dom";

type MenuProps = {
    area: string;
    // El ícono es un componente SVG de Lucide React — se lo pasás desde Sidebar
    icono: React.ReactNode;
    // Sin opciones, la sección es un link directo: no tiene flecha ni submenú
    opciones?: { label: string; href: string }[];
    // Estás dentro de esta sección (lo decide la URL): se pinta y se abre su submenú
    activa: boolean;
    href: string;
};

const Menu = ({ area, icono, opciones = [], activa, href }: MenuProps) => {
    const conSubmenu = opciones.length > 0;

    return (
        <li className="w-full">

            {/* ── BOTÓN PRINCIPAL DE LA SECCIÓN ──────────────────────────────
                Lleva al inicio de la sección. Volver a tocarlo no cierra el
                submenú: se cierra solo cuando la URL sale de la sección. */}
            <NavLink
                to={href}
                className={cn(
                    "mx-0 flex w-full cursor-pointer items-center gap-3 rounded-md px-4 py-2.5",
                    "text-sm font-semibold transition-colors duration-150",
                    activa
                        // Sección activa: blanco y un fondo apenas más claro, sin color de acento
                        ? "bg-white/[0.06] text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
                )}
            >
                {/* Ícono de la sección: más presente cuando la sección está activa */}
                <span className={cn("transition-opacity", activa ? "opacity-100" : "opacity-70")}>{icono}</span>

                {/* Nombre de la sección */}
                <span className="flex-1 text-left">{area}</span>

                {/* ── CHEVRON ANIMADO ──────────────────────────────────────────
                    rotate-180 gira la flecha cuando la sección está abierta.
                    transition-transform anima la rotación suavemente. */}
                {conSubmenu && (
                    <svg
                        className={cn("h-4 w-4 opacity-50 transition-transform duration-200", activa ? "rotate-180" : "")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </NavLink>

            {/* ── SUBMENÚ ──────────────────────────────────────────────────── */}
            {/*
                grid grid-rows-[0fr] / grid-rows-[1fr] es la forma moderna de animar
                altura de 0 a auto en CSS puro con Tailwind.
                overflow-hidden evita que el contenido se vea mientras colapsa.
            */}
            {conSubmenu && (
                <div className={cn("grid transition-all duration-200 ease-in-out", activa ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                        {/* Línea vertical izquierda — conecta visualmente las opciones con su sección */}
                        <ul className="ml-4 border-l border-white/10 py-1">
                            {opciones.map((opcion) => (
                                <Opcion key={opcion.href} label={opcion.label} href={opcion.href} />
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </li>
    );
};

export default Menu;
