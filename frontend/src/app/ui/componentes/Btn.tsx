import { cn } from "../../../lib/cn";

type Variant = 
    "primary" 
  | "secondary" 
  | "danger" 
  | "ghost" 
  | "outline" 
  | "success" 
  | "warning" 
  | "cancel";

type Size = 
    "sm" 
  | "md" 
  | "lg" 
  | "icon";

type BtnProps = React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

const Btn = ({ variant = "primary", size = "md", className = "", ...props }: BtnProps) => {

  // ✅ Agregué font-medium y focus:ring para accesibilidad (Tab navigation)
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<Variant, string> = {
    // ✅ Agregué shadow-sm y mejor hover en primary
    primary:   "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
    danger:    "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500",
    // ✅ ghost ahora es gris oscuro, no negro — más usable
    ghost:     "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500",
    // ✅ outline mejorado con border más definido
    outline:   "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    success:   "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus:ring-emerald-500",
    warning:   "bg-amber-400 text-amber-900 hover:bg-amber-500 focus:ring-amber-400",
    // ✅ cancel = outline pero más sutil, ideal para modales
    cancel:    "border border-gray-200 text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
  };

  const sizeStyles: Record<Size, string> = {
    sm:   "px-3 py-1.5 text-xs",
    md:   "px-4 py-2 text-sm",
    lg:   "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
};

export default Btn;

