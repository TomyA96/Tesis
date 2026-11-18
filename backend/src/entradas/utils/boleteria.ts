/*
    La boletería de una jornada es un lote más (sus tickets necesitan un lote
    para numerarse y para los informes), pero con nombre FIJO: lo pone el
    sistema, así no hay errores de tipeo y siempre se reconoce en el ticket
    impreso y en los informes. Por eso ese nombre queda reservado: ningún
    lote común puede llamarse así.
*/
export const NOMBRE_BOLETERIA = 'General Boletería';

// Sin mayúsculas ni tildes: "general boleteria" o "GENERAL BOLETERÍA" también chocan
const normalizar = (texto: string) =>
    texto.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const esNombreReservado = (descripcion: string) => normalizar(descripcion) === normalizar(NOMBRE_BOLETERIA);
