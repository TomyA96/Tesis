import type { Jornada } from "../../../services/jornadasService";

/*
    Cuándo una jornada se puede operar (vender en la puerta, controlar accesos,
    atender el buffet). Tiene que cumplir las dos cosas:
    1. Estar Activa: lo decide el organizador. Una jornada finalizada,
       suspendida o cancelada nunca se opera, aunque falten horas de margen.
    2. Estar dentro de la ventana de tiempo: desde unas horas antes del inicio
       hasta unas horas después del fin.

    Las horas de antes coinciden con el cierre de la venta online (2 h): desde
    ahí las entradas se venden en la puerta, así que no queda ningún momento sin
    forma de vender.

    OJO: esto hoy solo decide qué se muestra. Cuando se desarrolle el backend de
    operaciones, la misma regla tiene que aplicarse allá (con la hora del
    servidor), porque esconder una pantalla no impide llegar a ella por la URL.
*/
export const HORAS_ANTES_OPERACION = 2;
export const HORAS_DESPUES_OPERACION = 4;

const HORA_EN_MS = 60 * 60 * 1000;

type JornadaOperable = Pick<Jornada, "estado" | "fechaHoraInicio" | "fechaHoraFin">;

export const estaOperable = (jornada: JornadaOperable, ahora: Date = new Date()) => {
    if (jornada.estado !== "Activo") return false;

    const desde = new Date(jornada.fechaHoraInicio).getTime() - HORAS_ANTES_OPERACION * HORA_EN_MS;
    const hasta = new Date(jornada.fechaHoraFin).getTime() + HORAS_DESPUES_OPERACION * HORA_EN_MS;
    return ahora.getTime() >= desde && ahora.getTime() <= hasta;
};

export type MomentoJornada = "en-curso" | "por-comenzar" | "en-cierre";

// Dónde está la jornada respecto de su horario, para decirlo en la card
export const momentoDeJornada = (jornada: JornadaOperable, ahora: Date = new Date()): MomentoJornada => {
    if (ahora < new Date(jornada.fechaHoraInicio)) return "por-comenzar";
    if (ahora <= new Date(jornada.fechaHoraFin)) return "en-curso";
    return "en-cierre";
};
