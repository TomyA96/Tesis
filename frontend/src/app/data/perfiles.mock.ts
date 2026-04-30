import type { Perfil } from "./types";

/**
 * Mock de datos de Perfiles
 * Estos datos se usan durante el desarrollo para simular la base de datos.
 * Cuando integres el backend, reemplaza esto con llamadas a tu API.
 */

export const perfilesMock: Perfil[] = [
  {
    id: 1,
    nombre: "Administrador",
    areas: ["Seguridad", "Eventos", "Administración", "Informes", "Operaciones"],
    permisos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    usuariosAsignados: 3,
  },
  {
    id: 2,
    nombre: "Operador",
    areas: ["Eventos", "Administración"],
    permisos: [6, 7, 8, 9, 10],
    usuariosAsignados: 5,
  },
  {
    id: 3,
    nombre: "Supervisor",
    areas: ["Eventos", "Informes"],
    permisos: [6, 12],
    usuariosAsignados: 2,
  },
  {
    id: 4,
    nombre: "Analista de Datos",
    areas: ["Informes"],
    permisos: [12, 13],
    usuariosAsignados: 1,
  },
  {
    id: 5,
    nombre: "Gestor de Eventos",
    areas: ["Eventos", "Administración"],
    permisos: [6, 7, 9, 10],
    usuariosAsignados: 4,
  },
];
