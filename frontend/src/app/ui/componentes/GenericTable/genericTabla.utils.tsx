import type { ReactNode } from "react";
import { cn } from "../../../../lib/cn";
import { UserCheck, User, UserLock } from 'lucide-react';


export const renderId = (value: number): string =>
  String(value).padStart(3, "0");

export const renderFecha = (value: Date): string =>
  value.toLocaleString("es-AR");

export const renderEstado = (value: string | number): ReactNode => {
  const estado = String(value).toLowerCase();

  return (

    <span className={cn(
      "flex items-center justify-center gap-1 w-24 px-2.5  py-0.5 rounded-full text-xs font-semibold",
      estado === "activo"    && "bg-emerald-100 text-emerald-700",
      estado === "inactivo"  && "bg-gray-100 text-gray-700",
      estado === "bloqueado" && "bg-red-100 text-red-700",
  )}>
      {estado === "activo" && <UserCheck className="w-4 h-4" />}
      {estado === "inactivo" && <User className="w-4 h-4" />}
      {estado === "bloqueado" && <UserLock className="w-4 h-4" />}
      {value}
    </span>
  );
};
