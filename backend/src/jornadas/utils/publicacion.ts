/*
    Lo que hace falta mirar de una jornada para saber si se puede publicar.
    entradasHabilitadas viene de un conteo en la base (no se traen las entradas).
*/
export type JornadaARevisar = {
    nombre: string | null;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
    entradasHabilitadas: number;
};

/*
    Devuelve la lista de lo que le falta a una jornada para publicarse; vacía
    significa que está completa. Devuelve TODOS los problemas (no corta en el
    primero) para que el usuario los vea juntos y los resuelva de una vez.

    Las condiciones del evento (que esté publicado, que tenga imagen) no van
    acá: son del evento entero y se revisan una sola vez en quien llama.

    `hayVarias`: si el evento tiene más de una jornada vigente, el nombre es
    lo que las distingue para el público.
*/
export const faltantesParaPublicar = (jornada: JornadaARevisar, hayVarias: boolean, ahora = new Date()): string[] => {
    const faltantes: string[] = [];

    if (jornada.fechaHoraInicio <= ahora) {
        faltantes.push('La fecha de inicio ya pasó');
    }
    if (jornada.fechaHoraFin <= jornada.fechaHoraInicio) {
        faltantes.push('La fecha de fin debe ser posterior a la de inicio');
    }
    if (jornada.entradasHabilitadas === 0) {
        faltantes.push('No tiene entradas cargadas');
    }
    if (hayVarias && !jornada.nombre) {
        faltantes.push('Necesita un nombre para distinguirla de las otras jornadas');
    }
    return faltantes;
};
