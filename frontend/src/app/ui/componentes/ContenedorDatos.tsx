import type React from "react";
import { cn } from "../../../lib/cn";

type ContDatosProps = React.ComponentProps<"div">;

const ContenedorDatos = ({ className, children, ...props }: ContDatosProps) => {
  return (
    <div
      className={cn(
        // ✅ overflow-hidden es CLAVE: hace que la tabla respete el borde redondeado
        // ✅ Sombra más sutil y profesional
        // ✅ Eliminé el px-6 duplicado con p-4 — ahora sin padding propio,
        //    cada hijo (Header, Tabla) maneja su propio padding internamente
        "flex flex-col w-full bg-white rounded-2xl shadow-sm border-gray-100 overflow-hidden h-fit",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default ContenedorDatos;