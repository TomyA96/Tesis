import type { Permiso } from "./types";

/**
 * Mock de datos de Permisos
 * Estos datos se usan durante el desarrollo para simular la base de datos.
 * Cuando integres el backend, reemplaza esto con llamadas a tu API.
 */

export const permisosMock: Permiso[] = [
  // 🔐 Seguridad
  {
    id: 1,
    codigo: "seguridad.crearUsuario",
    descripcion: "Crear usuario",
  },
  {
    id: 2,
    codigo: "seguridad.editarUsuario",
    descripcion: "Editar usuario",
  },
  {
    id: 3,
    codigo: "seguridad.eliminarUsuario",
    descripcion: "Eliminar usuario",
  },
  {
    id: 4,
    codigo: "seguridad.crearPerfil",
    descripcion: "Crear perfil",
  },
  {
    id: 5,
    codigo: "seguridad.editarPerfil",
    descripcion: "Editar perfil",
  },

  // 🎉 Eventos
  {
    id: 6,
    codigo: "eventos.crearEvento",
    descripcion: "Crear evento",
  },
  {
    id: 7,
    codigo: "eventos.editarEvento",
    descripcion: "Editar evento",
  },
  {
    id: 8,
    codigo: "eventos.eliminarEvento",
    descripcion: "Eliminar evento",
  },

  // 💰 Finanzas
  {
    id: 9,
    codigo: "finanzas.verIngresos",
    descripcion: "Ver ingresos",
  },
  {
    id: 10,
    codigo: "finanzas.verGastos",
    descripcion: "Ver gastos",
  },
  {
    id: 11,
    codigo: "finanzas.generarBalance",
    descripcion: "Generar balance",
  },

  // 📊 Informes
  {
    id: 12,
    codigo: "informes.verReportes",
    descripcion: "Ver reportes",
  },
  {
    id: 13,
    codigo: "informes.exportarReportes",
    descripcion: "Exportar reportes",
  },
];
