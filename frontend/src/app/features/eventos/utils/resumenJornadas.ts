import type { Evento } from "../../../services/eventosService";
import type { Jornada } from "../../../services/jornadasService";

/*
    Los estados que importan en el día a día son los de las jornadas: el
    evento solo pasa por Borrador, Activo y Finalizado. Una jornada Activa
    que ya terminó sigue Activa hasta que alguien la finaliza: por eso se
    separa en "próximas" (todavía no terminó) y "sin finalizar" (ya terminó).
*/
export const jornadaSinFinalizar = (jornada: Jornada, ahora: Date) =>
    jornada.estado === "Activo" && new Date(jornada.fechaHoraFin) <= ahora;

export type ResumenJornadas = {
    proximas: number;
    sinFinalizar: number;
    borrador: number;
    finalizadas: number;
    suspendidas: number;
    canceladas: number;
};

export const resumirJornadas = (eventos: Evento[], ahora: Date): ResumenJornadas => {
    const resumen: ResumenJornadas = {
        proximas: 0,
        sinFinalizar: 0,
        borrador: 0,
        finalizadas: 0,
        suspendidas: 0,
        canceladas: 0,
    };
    for (const jornada of eventos.flatMap((e) => e.jornadas)) {
        if (jornada.estado === "Activo") {
            if (jornadaSinFinalizar(jornada, ahora)) resumen.sinFinalizar++;
            else resumen.proximas++;
        }
        if (jornada.estado === "Borrador") resumen.borrador++;
        if (jornada.estado === "Finalizado") resumen.finalizadas++;
        if (jornada.estado === "Suspendido") resumen.suspendidas++;
        if (jornada.estado === "Cancelado") resumen.canceladas++;
    }
    return resumen;
};
