import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/cn";
type OpcionProps = {
    label: string;
    href: string;
    
    
};

const Opcion = ({ label, href }: OpcionProps) => {
    return (
        <li>
            <NavLink
                to={href}
                className={({ isActive }) => cn(
                    "cursor-pointer flex items-center gap-2 px-4 py-2 mx-2 rounded-md",  
                    "text-sm font-medium transition-colors duration-150",
                    isActive
                        // Activo: fondo sutil con acento de color
                        ? "bg-blue-600/20 text-blue-400"
                        // Inactivo: texto gris claro, hover sutil
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                    )
                }
            >
                {/* Punto indicador — reemplazará al ml-10 hardcodeado */}
                {/* Es más elegante y visualmente conecta la opción con su menú padre */}
                
                {label}
            </NavLink>
        </li>
    );
};

export default Opcion;

