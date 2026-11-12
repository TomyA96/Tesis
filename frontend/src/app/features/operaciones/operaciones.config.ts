import { RUTAS } from "../../constantes/Rutas";

/*
    Las tres cosas que se pueden hacer sobre una jornada, con el permiso que
    pide cada una. La home muestra solo los botones que el usuario puede usar,
    y las rutas piden el mismo permiso: así quien atiende la puerta no entra al
    buffet, y al revés. Los códigos vienen del seed de permisos del backend.
*/
export type AccionOperacion = {
    clave: "accesos" | "ventaEntradas" | "buffet";
    etiqueta: string;
    permiso: string;
    ruta: (idJornada: number | string) => string;
};

export const ACCIONES_OPERACION: AccionOperacion[] = [
    { clave: "accesos", etiqueta: "Control de accesos", permiso: "accesos.registrar", ruta: RUTAS.operaciones.accesos },
    { clave: "ventaEntradas", etiqueta: "Venta de entradas", permiso: "entradas.vender", ruta: RUTAS.operaciones.ventaEntradas },
    { clave: "buffet", etiqueta: "Buffet", permiso: "buffet.vender", ruta: RUTAS.operaciones.buffet },
];
