/*
    Los eventos se realizan en Argentina: la hora que se carga y la que se
    muestra es siempre la hora argentina, sin importar la zona horaria de la
    computadora de quien mira. Argentina no usa horario de verano desde 2009,
    así que el desfase con UTC es fijo.
*/
export const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";
export const OFFSET_ARGENTINA = "-03:00";

export const fechaArgentina = (valor: string | Date) =>
    new Date(valor).toLocaleDateString("es-AR", { timeZone: ZONA_ARGENTINA });

export const horaArgentina = (valor: string | Date) =>
    new Date(valor).toLocaleTimeString("es-AR", {
        timeZone: ZONA_ARGENTINA,
        hour: "2-digit",
        minute: "2-digit",
    });
