import type { Usuario } from "./types";

/**
 * Mock de datos de Usuarios
 * Estos datos se usan durante el desarrollo para simular la base de datos.
 * Cuando integres el backend, reemplaza esto con llamadas a tu API.
 */
 
export const usuariosMock: Usuario[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    perfil: "Administrador",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-12T10:30:00"),
  },
  {
    id: 2,
    nombre: "María Gómez",
    perfil: "Operador",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-11T18:15:00"),
  },
  {
    id: 3,
    nombre: "Carlos López",
    perfil: "Supervisor",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-10T09:00:00"),
  },
  {
    id: 4,
    nombre: "Lucía Fernández",
    perfil: "Operador",
    estado: "Inactivo",
    ultimoAcceso: new Date("2026-03-28T14:45:00"),
  },
  {
    id: 5,
    nombre: "Martín Rodríguez",
    perfil: "Administrador",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-12T20:10:00"),
  },
  {
    id: 6,
    nombre: "Sofía Martínez",
    perfil: "Supervisor",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-11T11:25:00"),
  },
  {
    id: 7,
    nombre: "Diego Torres",
    perfil: "Operador",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-12T08:55:00"),
  },
  {
    id: 8,
    nombre: "Valentina Castro",
    perfil: "Administrador",
    estado: "Bloqueado",
    ultimoAcceso: new Date("2026-02-20T16:40:00"),
  },
  {
    id: 9,
    nombre: "Andrés Ramírez",
    perfil: "Operador",
    estado: "Activo",
    ultimoAcceso: new Date("2026-04-12T12:20:00"),
  },
  {
    id: 10,
    nombre: "Paula Sánchez",
    perfil: "Supervisor",
    estado: "Inactivo",
    ultimoAcceso: new Date("2026-03-15T09:30:00"),
  },
];
