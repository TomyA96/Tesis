import { api } from "./api";

export interface Perfil {
  id: number;
  nombre: string;
  descripcion: string | null;
}
export interface CrearPerfil{
  nombre: string;
  descripcion?: string;
  idsPermisos: number[];
}

export interface UpdatePerfil{
  nombre?: string;
  descripcion?: string;
  idsPermisos?: number[];
}

export function getPerfiles() {
    return api.get<Perfil[]>("/perfiles");
}

export function createPerfil(perfil: CrearPerfil){
  return api.post<CrearPerfil>("/perfiles", perfil)
}

export function updatePerfil( id: number ,data: UpdatePerfil){
  return api.put<UpdatePerfil>(`/perfiles/${id}`, data)
}

export function deletePerfil(id: number) {
    return api.delete(`/perfiles/${id}`);
}