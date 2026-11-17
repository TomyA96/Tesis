import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/cn";

type OpcionProps = {
    label: string;
    href: string;
};

/*
    Una opción dentro del submenú de una sección. La activa no se pinta de
    color: queda en blanco, con un fondo apenas más claro y una rayita sobre
    la línea vertical del submenú (el ::before), que marca dónde estás sin
    competir con el contenido de la página.
*/
const Opcion = ({ label, href }: OpcionProps) => {
    return (
        <li>
            <NavLink
                to={href}
                className={({ isActive }) =>
                    cn(
                        "relative mx-2 flex cursor-pointer items-center gap-2 rounded-md px-4 py-2",
                        "text-sm font-medium transition-colors duration-150",
                        isActive
                            ? "bg-white/[0.06] text-white before:absolute before:-left-[9px] before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-white/80"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-100",
                    )
                }
            >
                {label}
            </NavLink>
        </li>
    );
};

export default Opcion;
