// ═══════════════════════════════════════════════════════════════════════════════
// Textarea.tsx
// Mismo comportamiento y estilo que Input, pero para textos de varias líneas.
// ═══════════════════════════════════════════════════════════════════════════════
import { cn } from "../../../lib/cn";

type TextareaProps = React.ComponentProps<"textarea"> & {
    label?: string;
};

const Textarea = ({ label, className = "", id, ...props }: TextareaProps) => {
    /*
        Igual que en Input: si el padre no pasa un id, lo generamos a partir del
        name para que el label quede conectado al campo (accesibilidad).
    */
    const textareaId = id ?? (props.name ? `textarea-${props.name}` : undefined);

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={cn(
                    // Estilos base — los mismos que Input para que se vean como una familia
                    "border border-gray-300 rounded-md px-3 py-2 text-sm",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                    "transition-colors duration-150",
                    // resize-none evita que el usuario deforme el layout del modal
                    "resize-none",
                    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200",
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default Textarea;
