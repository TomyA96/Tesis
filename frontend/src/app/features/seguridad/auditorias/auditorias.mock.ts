import type { Auditoria } from "./types";

export const auditoriasMock: Auditoria[] = [
  { id: 1, usuario: "Tomas", accionRealizada: "Iniciar Sesion", fecha: "21/11/2025", hora: "10:15", resultado: "t" },
  { id: 2, usuario: "Tomas", accionRealizada: "Crear Usuario", fecha: "21/11/2025", hora: "10:45", resultado: "t" },
  { id: 3, usuario: "Tomas", accionRealizada: "Eliminar Usuario", fecha: "21/11/2025", hora: "10:15", resultado: "f" },
];
