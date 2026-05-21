export type ResultadoAuditoria = "t" | "f";

export type Auditoria = {
  id: number;
  usuario: string;
  accionRealizada: string;
  fecha: string;
  hora: string;
  resultado: ResultadoAuditoria;
};
