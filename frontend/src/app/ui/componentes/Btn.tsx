import { cn } from "../../../lib/cn";
// Definimos las propiedades que acepta el botón
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    // variant es opcional (?) y solo puede ser uno de estos valores (|)
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning" | "cancel";
  // size es opcional y solo puede ser uno de estos valores
  size?: "sm" | "md" | "lg" | "icon";
};

const Btn = ({
    // Valores por defecto si no me pasan nada
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: BtnProps) => {
    // Estilos que siempre tendrá el botón
  const baseStyles = "rounded-md  transition-all cursor-pointer";
// Estilos según el tipo de botón (variant)
  const variantStyles: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-300 text-black hover:bg-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-black text-white hover:bg-gray-400 ",
    outline: "border border-gray-400 text-gray-800 hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-400 text-black hover:bg-yellow-500",
    cancel: "bg-transparent border border-gray-400 text-gray-800 hover:bg-gray-200",
  };
// Estilos según el tamaño del botón
  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2 text-xl",
  };

  // Acá concatenamos todas las clases finales del botón


  return <button className={cn(baseStyles , variantStyles[variant], sizeStyles[size], className)} {...props} />;
};

export default Btn;

{/* primary → acción principal (crear, guardar, confirmar, “siguiente”)
secondary → acciones secundarias (editar, detalles, acciones menos importantes)
danger → eliminar, cerrar sesión, bloquear usuario
ghost → botones sin fondo para acciones muy suaves
outline → acciones neutras o menos importantes, sin relleno
success → operaciones exitosas (guardar cambios, confirmar)
warning → advertencias, acciones de riesgo moderado
cancel → cancelar, volver atrás, cerrar modal */}