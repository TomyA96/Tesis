import { fechaCortaConDia, horaArgentina } from "../../utils/zonaHoraria";

/*
    Las fechas de un evento para el público:
    - una sola jornada: "dom 15/11 · 21:00" (aunque termine pasada la
      medianoche, es una sola noche);
    - varias: "del vie 20/11 al dom 22/11", por el día en que EMPIEZA cada
      una: la última puede terminar de madrugada del día siguiente.
*/
export const fechasDelEvento = (jornadas: { fechaHoraInicio: string }[]) => {
    if (jornadas.length === 0) return "";
    const primera = jornadas[0].fechaHoraInicio;
    const ultima = jornadas[jornadas.length - 1].fechaHoraInicio;
    const desde = fechaCortaConDia(primera);
    const hasta = fechaCortaConDia(ultima);
    if (jornadas.length === 1 || desde === hasta) return `${desde} · ${horaArgentina(primera)}`;
    return `del ${desde} al ${hasta}`;
};
