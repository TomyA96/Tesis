import { EstadoEvento } from '@prisma/client';

/*
    Cuándo una jornada se puede operar (registrar accesos, vender en la puerta,
    atender el buffet). Tiene que cumplir las dos cosas:
    1. Estar Activa: lo decide el organizador. Una jornada finalizada,
       suspendida o cancelada nunca se opera, aunque falten horas de margen.
    2. Estar dentro de la ventana de tiempo: desde unas horas antes del inicio
       hasta unas horas después del fin.

    Las horas de antes coinciden con el cierre de la venta online
    (HORAS_CIERRE_VENTA_ONLINE): desde ahí las entradas se venden en la puerta,
    así que no queda ningún momento sin forma de vender.

    Es la misma regla que usa el frontend para decidir qué mostrar (ver
    ventanaOperacion.ts allá); la que manda es esta, con la hora del servidor.
*/
export const HORAS_ANTES_OPERACION = 2;
export const HORAS_DESPUES_OPERACION = 4;

const HORA_EN_MS = 60 * 60 * 1000;

type JornadaOperable = {
    estado: EstadoEvento;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
};

export const estaOperable = (jornada: JornadaOperable, ahora: Date = new Date()): boolean => {
    if (jornada.estado !== 'Activo') return false;

    const desde = jornada.fechaHoraInicio.getTime() - HORAS_ANTES_OPERACION * HORA_EN_MS;
    const hasta = jornada.fechaHoraFin.getTime() + HORAS_DESPUES_OPERACION * HORA_EN_MS;
    return ahora.getTime() >= desde && ahora.getTime() <= hasta;
};
