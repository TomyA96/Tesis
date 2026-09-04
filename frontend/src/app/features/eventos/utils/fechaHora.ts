// Conversión entre fechas reales (Date) y los campos sueltos que usan los
// formularios de eventos: fecha, hora, y duración en horas.

// Los inputs date/time exigen dos dígitos: "03", no "3".
export const dosDigitos = (n: number) => String(n).padStart(2, "0");

/*
    Convierte un Date a los strings que necesitan los inputs. Usa los getters
    locales (getHours, no getUTCHours) a propósito: el Date construido a
    partir del string ISO que manda la API está en UTC, y estos getters lo
    devuelven ya convertido a la zona del navegador — la hora que el usuario
    realmente cargó.
*/
export const fechaAInputs = (fecha: Date) => ({
    // getMonth() arranca en 0 (enero), por eso el +1
    fecha: `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`,
    hora: `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`,
});

// Inverso de fechaAInputs: junta fecha y hora sueltas en un solo Date.
export const combinarFechaHora = (fecha: string, hora: string) => new Date(`${fecha}T${hora}`);

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
