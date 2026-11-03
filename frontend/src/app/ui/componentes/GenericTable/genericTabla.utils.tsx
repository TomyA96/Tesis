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

export const listarPerfilesUsuario = (perfiles: { idPerfil: number; perfil: { nombre: string } }[]) => {
  if (!perfiles || perfiles.length === 0) {
    return "—"; // Retorna un guion si no hay perfiles
  }
  return (
  <>
      {perfiles.map((perfil) => (
          <span key={perfil.idPerfil} className="flex w-fit mt-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold mr-1">
              {perfil.perfil.nombre.at(0)?.toUpperCase() + perfil.perfil.nombre.slice(1).toLowerCase()}
          </span>
      ))}
  </>);
}