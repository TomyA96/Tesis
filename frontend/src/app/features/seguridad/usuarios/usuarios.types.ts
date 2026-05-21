export interface Usuario {
  id: number;
  nombre: string;
  perfil: number;
  estado: "activo" | "inactivo";
}