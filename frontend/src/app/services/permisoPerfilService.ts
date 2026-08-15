import { api } from "./api";
export interface PermisoPerfil{
    idPerfil:number;
    idPermiso: number;
}

export function getPermisosPerfil(idPerfil:number){
    return api.get<PermisoPerfil[]>(`/permiso-perfil/perfil/${idPerfil}`)
}

export async function arrayPermisos(id: number): Promise<number[]> { 
    const data = await getPermisosPerfil(id);
    
    return data.map((fila) => fila.idPermiso)
}