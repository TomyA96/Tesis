
// ═══════════════════════════════════════════════════════════════════════════════
// Input.tsx
// ═══════════════════════════════════════════════════════════════════════════════
import { cn } from "../../../lib/cn";
 
type InputProps = React.ComponentProps<"input"> & {
    label?: string;
};
 
const Input = ({ label, className = "", id, ...props }: InputProps) => {
    /*
        Si el padre no pasa un id, generamos uno a partir del name.
        Esto conecta automáticamente el label con el input para accesibilidad
        sin que el usuario del componente tenga que recordar pasarlo.
        El operador ?? significa "si lo de la izquierda es null/undefined, usá lo de la derecha"
    */
    const inputId = id ?? (props.name ? `input-${props.name}` : undefined);
 
    return (
        <div className="flex flex-col gap-1">
            {label && (
                // htmlFor conecta el label con el input — al hacer click en el label
                // el input recibe el foco automáticamente
                <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={cn(
                    // Estilos base
                    "border border-gray-300 rounded-md px-3 py-2 text-sm",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                    "transition-colors duration-150",
                    // Estilos cuando está deshabilitado
                    // disabled: es un modificador de Tailwind que aplica estilos cuando el input tiene disabled={true}
                    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200",
                    className
                )}
                {...props}
            />
        </div>
    );
};
 
export default Input;