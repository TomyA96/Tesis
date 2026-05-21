import { usuariosMock } from "../usuarios/usuarios.mock";

export interface Auditoria {
  id: number | string;
  idUsuario: number;
  nombreUsuario: string;
  accion: string;
  fecha: string;
  hora: string;
  idEntidadAfectada: number;
  nombreEntidadAfectada: string;
}

export const auditoriasMock: Auditoria[] = [
  {
    id: 1,
    idUsuario: usuariosMock[0].id,
    nombreUsuario: usuariosMock[0].nombre,
    accion: "Creo evento",
    fecha: "2026-04-18",
    hora: "08:30",
    idEntidadAfectada: 101,
    nombreEntidadAfectada: "Expo Tecnologia 2026",
  },
  {
    id: 2,
    idUsuario: usuariosMock[1].id,
    nombreUsuario: usuariosMock[1].nombre,
    accion: "Actualizo perfil",
    fecha: "2026-04-18",
    hora: "09:10",
    idEntidadAfectada: 2,
    nombreEntidadAfectada: "Supervisor",
  },
  {
    id: 3,
    idUsuario: usuariosMock[2].id,
    nombreUsuario: usuariosMock[2].nombre,
    accion: "Asigno proveedor",
    fecha: "2026-04-18",
    hora: "10:05",
    idEntidadAfectada: 301,
    nombreEntidadAfectada: "Catering Los Andes",
  },
  {
    id: 4,
    idUsuario: usuariosMock[4].id,
    nombreUsuario: usuariosMock[4].nombre,
    accion: "Registro invitado",
    fecha: "2026-04-19",
    hora: "11:20",
    idEntidadAfectada: 401,
    nombreEntidadAfectada: "Lucia Martinez",
  },
  {
    id: 5,
    idUsuario: usuariosMock[5].id,
    nombreUsuario: usuariosMock[5].nombre,
    accion: "Modifico presupuesto",
    fecha: "2026-04-19",
    hora: "12:15",
    idEntidadAfectada: 501,
    nombreEntidadAfectada: "Presupuesto Evento Corporativo",
  },
  {
    id: 6,
    idUsuario: usuariosMock[7].id,
    nombreUsuario: usuariosMock[7].nombre,
    accion: "Cambio estado de usuario",
    fecha: "2026-04-19",
    hora: "13:40",
    idEntidadAfectada: usuariosMock[11].id,
    nombreEntidadAfectada: usuariosMock[11].nombre,
  },
  {
    id: 7,
    idUsuario: usuariosMock[9].id,
    nombreUsuario: usuariosMock[9].nombre,
    accion: "Genero reporte",
    fecha: "2026-04-20",
    hora: "14:25",
    idEntidadAfectada: 601,
    nombreEntidadAfectada: "Reporte de Ventas Abril",
  },
  {
    id: 8,
    idUsuario: usuariosMock[12].id,
    nombreUsuario: usuariosMock[12].nombre,
    accion: "Edito salon",
    fecha: "2026-04-20",
    hora: "15:50",
    idEntidadAfectada: 701,
    nombreEntidadAfectada: "Salon Principal Norte",
  },
  {
    id: 9,
    idUsuario: usuariosMock[16].id,
    nombreUsuario: usuariosMock[16].nombre,
    accion: "Reasigno coordinador",
    fecha: "2026-04-20",
    hora: "16:35",
    idEntidadAfectada: 801,
    nombreEntidadAfectada: "Congreso Medico Regional",
  },
  {
    id: 10,
    idUsuario: usuariosMock[18].id,
    nombreUsuario: usuariosMock[18].nombre,
    accion: "Elimino invitado",
    fecha: "2026-04-21",
    hora: "17:45",
    idEntidadAfectada: 402,
    nombreEntidadAfectada: "Carlos Dominguez",
  },
];
