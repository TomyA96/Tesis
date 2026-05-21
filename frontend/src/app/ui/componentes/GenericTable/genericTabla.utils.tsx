import type { ReactNode } from "react";
import { cn } from "../../../../lib/cn";
import { UserCheck, User, UserLock } from 'lucide-react';


export const renderId = (value: number): string =>
  String(value).padStart(3, "0");

export const renderFecha = (value: Date): string =>
  value.toLocaleString("es-AR");

export const renderEstado = (value: string | number): ReactNode => {
  return (

    <span className={cn(
      "flex items-center justify-center gap-1 w-24 px-2.5  py-0.5 rounded-full text-xs font-semibold",
      value === "activo"    && "bg-emerald-100 text-emerald-700",
      value === "inactivo"  && "bg-gray-100 text-gray-700",
      value === "bloqueado" && "bg-red-100 text-red-700",
  )}>
      {value === "activo" && <UserCheck className="w-4 h-4" />}
      {value === "inactivo" && <User className="w-4 h-4" />}
      {value === "bloqueado" && <UserLock className="w-4 h-4" />}
      {value}
    </span>
  );
};
