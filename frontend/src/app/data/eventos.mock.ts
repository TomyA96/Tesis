import type { Evento } from "./types";

/**
 * Mock de datos de Eventos
 * Estos datos se usan durante el desarrollo para simular la base de datos.
 * Cuando integres el backend, reemplaza esto con llamadas a tu API.
 */

export const eventosMock: Evento[] = [
  {
    id: 1,
    nombre: "Expo Tecnología 2026",
    fecha: "2026-05-15",
    estado: "activo",
    lugar: "Centro de Convenciones Downtown",
    capacidad: 1200,
    entradasVendidas: 850,
  },
  {
    id: 2,
    nombre: "Festival Rock Argentina",
    fecha: "2026-06-20",
    estado: "activo",
    lugar: "Complejo Arena",
    capacidad: 5000,
    entradasVendidas: 2300,
  },
  {
    id: 3,
    nombre: "Congreso de Marketing Digital",
    fecha: "2026-07-10",
    estado: "borrador",
    lugar: "Hotel Plaza Mayor",
    capacidad: 600,
    entradasVendidas: 0,
  },
  {
    id: 4,
    nombre: "Feria Gamer 2026",
    fecha: "2026-08-05",
    estado: "activo",
    lugar: "Parque Central Eventos",
    capacidad: 800,
    entradasVendidas: 450,
  },
  {
    id: 5,
    nombre: "Encuentro Startups Latinoamérica",
    fecha: "2026-09-12",
    estado: "activo",
    lugar: "Hub de Innovación Tech",
    capacidad: 300,
    entradasVendidas: 210,
  },
  {
    id: 6,
    nombre: "Festival de Cine Independiente",
    fecha: "2025-11-08",
    estado: "finalizado",
    lugar: "Teatro Municipal",
    capacidad: 400,
    entradasVendidas: 380,
  },
  {
    id: 7,
    nombre: "Conferencia de Desarrolladores",
    fecha: "2025-09-20",
    estado: "finalizado",
    lugar: "Auditorio Central",
    capacidad: 700,
    entradasVendidas: 680,
  },
  {
    id: 8,
    nombre: "Concierto Benéfico",
    fecha: "2024-12-10",
    estado: "cancelado",
    lugar: "Estadio Principal",
    capacidad: 10000,
    entradasVendidas: 3500,
  },
  {
    id: 9,
    nombre: "Workshop de Diseño UX/UI",
    fecha: "2026-05-25",
    estado: "activo",
    lugar: "Espacio Creativo Coworking",
    capacidad: 150,
    entradasVendidas: 120,
  },
  {
    id: 10,
    nombre: "Seminario de Negocios Internacionales",
    fecha: "2026-10-03",
    estado: "borrador",
    lugar: "Centro Empresarial Business Hub",
    capacidad: 500,
    entradasVendidas: 0,
  },
];
