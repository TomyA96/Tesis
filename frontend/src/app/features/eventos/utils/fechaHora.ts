// Conversión entre fechas reales (Date) y los campos sueltos que usan los
// formularios de eventos: fecha, hora, y duración en horas.

import { OFFSET_ARGENTINA, ZONA_ARGENTINA } from "../../../utils/zonaHoraria";

// Los inputs date/time exigen dos dígitos: "03", no "3".
export const dosDigitos = (n: number) => String(n).padStart(2, "0");

/*
    Convierte un Date a los strings que necesitan los inputs, siempre en hora
    argentina (no la de la computadora): así un evento cargado a las 20:00 se
    ve a las 20:00 sin importar desde dónde lo abra cada usuario.
    El locale "sv-SE" se usa solo porque da la fecha como AAAA-MM-DD, que es
    el formato que exige el input type="date".
*/
export const fechaAInputs = (fecha: Date) => ({
    fecha: fecha.toLocaleDateString("sv-SE", { timeZone: ZONA_ARGENTINA }),
    hora: fecha.toLocaleTimeString("es-AR", {
        timeZone: ZONA_ARGENTINA,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }),
});

/*
    Inverso de fechaAInputs: junta fecha y hora sueltas en un solo Date,
    interpretando lo que se escribió como hora argentina. Sin el offset, JS lo
    tomaría como hora de la computadora de quien carga el evento.
*/
export const combinarFechaHora = (fecha: string, hora: string) =>
    new Date(`${fecha}T${hora}${OFFSET_ARGENTINA}`);

// Diferencia entre dos fechas, en horas — para precargar el campo "duración".
export const calcularDuracionHoras = (inicio: Date, fin: Date) =>
    String((fin.getTime() - inicio.getTime()) / (60 * 60 * 1000));

/*
    Suma una duración (en horas) sobre una fecha de inicio. Devuelve un Date
    NUEVO en vez de mutar inicio con setHours(), que lo dejaría corrompido si
    se reutiliza después (por ejemplo, para comparar contra la fecha original).
*/
export const sumarDuracion = (inicio: Date, horas: number) =>
    new Date(inicio.getTime() + horas * 60 * 60 * 1000);
