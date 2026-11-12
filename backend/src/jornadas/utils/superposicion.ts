// Lo mínimo que hace falta de una jornada para saber cuándo ocupa: sirve tanto
// para las que vienen en un DTO como para las que ya están guardadas.
export type Tramo = { fechaHoraInicio: Date; fechaHoraFin: Date };

/*
    Dos tramos se superponen si CADA UNO empieza antes de que termine el otro.
    Con los extremos exclusivos (< y no <=), que una termine justo cuando empieza
    la otra no cuenta como choque: 22:00-02:00 y 02:00-06:00 pueden convivir.
*/
export const seSuperponen = (a: Tramo, b: Tramo) =>
    a.fechaHoraInicio < b.fechaHoraFin && b.fechaHoraInicio < a.fechaHoraFin;

/*
    Busca choques dentro de una lista. Devuelve las posiciones de cada par que
    se pisa, vacío si no hay ninguno. Es el mismo criterio que hallarSuperposiciones
    del frontend, pero acá trabaja con Date reales y no con textos del formulario.
*/
export const hallarSuperposiciones = (tramos: Tramo[]): [number, number][] => {
    const choques: [number, number][] = [];

    for (let i = 0; i < tramos.length; i++) {
        // j empieza en i + 1: así cada par se compara una sola vez y ninguno consigo mismo
        for (let j = i + 1; j < tramos.length; j++) {
            if (seSuperponen(tramos[i], tramos[j])) {
                choques.push([i, j]);
            }
        }
    }
    return choques;
};
