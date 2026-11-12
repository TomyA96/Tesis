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

/*
    "vie 20/11": para tarjetas y listas, donde ayuda reconocer el día de la
    semana. Se arma con las partes (formatToParts) porque el formato que da
    el navegador para día y mes sin año varía ("20-11" en Chrome).
*/
export const fechaCortaConDia = (valor: string | Date) => {
    const partes = new Intl.DateTimeFormat("es-AR", {
        timeZone: ZONA_ARGENTINA,
        weekday: "short",
        day: "numeric",
        month: "numeric",
    }).formatToParts(new Date(valor));
    const parte = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((p) => p.type === tipo)?.value ?? "";
    return `${parte("weekday")} ${parte("day")}/${parte("month")}`;
};

// "20:00": en Argentina se usa el reloj de 24 horas (sin hourCycle, Chrome muestra "08:00 p. m.")
export const horaArgentina = (valor: string | Date) =>
    new Date(valor).toLocaleTimeString("es-AR", {
        timeZone: ZONA_ARGENTINA,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
