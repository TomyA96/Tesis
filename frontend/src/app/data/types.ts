/**
 * Tipos compartidos para los mocks de datos
 */

// 🔐 Tipos de Seguridad
export type EstadoUsuario = "Activo" | "Inactivo" | "Bloqueado";

export interface Usuario {
  id: number;
  nombre: string;
  perfil: string;
  estado: EstadoUsuario;
  ultimoAcceso: Date;
}

export interface Perfil {
  id: number;
  nombre: string;
  areas: string[];
  permisos: number[];
  usuariosAsignados: number;
}

export interface Permiso {
  id: number;
  codigo: string;
  descripcion: string;
}

// 🎉 Tipos de Eventos
export type EventoEstado = "activo" | "borrador" | "finalizado" | "cancelado";

export interface Evento {
  id: number;
  nombre: string;
  fecha: string;
  estado: EventoEstado;
  lugar: string;
  capacidad: number;
  entradasVendidas: number;
}
