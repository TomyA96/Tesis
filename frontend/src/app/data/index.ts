/**
 * Archivo de índice para acceso centralizado a todos los mocks de datos
 * 
 * Uso:
 * import { usuariosMock, perfilesMock, eventosMock, permisosMock } from "@/app/data";
 * 
 * O importar solo lo que necesites:
 * import { usuariosMock } from "@/app/data/usuarios.mock";
 */

export * from "./types";
export { usuariosMock } from "./usuarios.mock";
export { perfilesMock } from "./perfiles.mock";
export { permisosMock } from "./permisos.mock";
export { eventosMock } from "./eventos.mock";
