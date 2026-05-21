// ═══════════════════════════════════════════════════════════════════════════════
// Select.tsx
// ═══════════════════════════════════════════════════════════════════════════════
import { cn } from "../../../lib/cn";
 
export type Opcion = {
    label: string;
    value: string | number;
};
 
type SelectProps = React.ComponentProps<"select"> & {
    opciones: Opcion[];
    label?:   string;
};
 
const Select = ({ label, opciones, className = "", id, ...props }: SelectProps) => {
    // Mismo patrón que Input — generamos el id automáticamente desde el name
    const selectId = id ?? (props.name ? `select-${props.name}` : undefined);
 
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={cn(
                    "border border-gray-300 rounded-md px-3 py-2 text-sm",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                    "transition-colors duration-150",
                    // appearance-none elimina la flecha nativa del navegador
                    // bg-white asegura fondo blanco en todos los navegadores
                    "bg-white",
                    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200",
                    className
                )}
                {...props}
            >
                {opciones.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
 
export default Select;

        