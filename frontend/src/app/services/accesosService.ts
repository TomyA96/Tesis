import { api } from "./api";

// Un ingreso ya registrado, para la lista de "últimos ingresos" de la puerta
export interface Acceso {
    id: number;
    fechaHora: string;
    ticket: { numero: string; entrada: { descripcion: string } };
    usuario: { nombre: string };
}

/*
    Lo que devuelve registrar un ingreso. Si el ticket no puede pasar, el
    backend responde con error y su mensaje dice por qué (ya ingresó, es de
    otra jornada, está anulado...): eso llega como el mensaje del Error.
    La advertencia avisa que entra igual, pero su venta no quedó registrada.
*/
export interface IngresoRegistrado {
    ticket: { id: number; numero: string; entrada: string };
    advertencia: string | null;
}

export interface ResumenAccesos {
    ingresaron: number;
    capacidad: number;
}

export function getAccesos(idJornada: number) {
    return api.get<Acceso[]>(`/jornadas/${idJornada}/accesos`);
}

export function getResumenAccesos(idJornada: number) {
    return api.get<ResumenAccesos>(`/jornadas/${idJornada}/accesos/resumen`);
}

// La jornada va en la URL y el usuario sale del token: solo se manda lo que leyó el lector
export function registrarAcceso(idJornada: number, codigoQR: string) {
    return api.post<IngresoRegistrado>(`/jornadas/${idJornada}/accesos`, { codigoQR });
}
