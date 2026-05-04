
export interface Usuario {
  id: number;
  nombre: string;
  perfil: number;
  estado: "activo" | "inactivo";
}

export const usuariosMock: Usuario[] = [
  { id: 1, nombre: "Ana Perez", perfil: 1, estado: "activo" },
  { id: 2, nombre: "Bruno Gomez", perfil: 2, estado: "activo" },
  { id: 3, nombre: "Carla Ruiz", perfil: 3, estado: "activo" },
  { id: 4, nombre: "Diego Fernandez", perfil: 4, estado: "inactivo" },
  { id: 5, nombre: "Elena Torres", perfil: 5, estado: "activo" },
  { id: 6, nombre: "Facundo Diaz", perfil: 6, estado: "activo" },
  { id: 7, nombre: "Gabriela Sosa", perfil: 7, estado: "activo" },
  { id: 8, nombre: "Hector Romero", perfil: 8, estado: "inactivo" },
  { id: 9, nombre: "Ines Medina", perfil: 9, estado: "activo" },
  { id: 10, nombre: "Javier Castro", perfil: 10, estado: "activo" },
  { id: 11, nombre: "Karen Molina", perfil: 1, estado: "activo" },
  { id: 12, nombre: "Lucas Vega", perfil: 2, estado: "inactivo" },
  { id: 13, nombre: "Mariana Rios", perfil: 3, estado: "activo" },
  { id: 14, nombre: "Nicolas Herrera", perfil: 4, estado: "activo" },
  { id: 15, nombre: "Olga Acosta", perfil: 5, estado: "activo" },
  { id: 16, nombre: "Pablo Navarro", perfil: 6, estado: "inactivo" },
  { id: 17, nombre: "Rocio Benitez", perfil: 7, estado: "activo" },
  { id: 18, nombre: "Sergio Cabrera", perfil: 8, estado: "activo" },
  { id: 19, nombre: "Tamara Ibarra", perfil: 9, estado: "activo" },
  { id: 20, nombre: "Ulises Flores", perfil: 10, estado: "inactivo" },
];
