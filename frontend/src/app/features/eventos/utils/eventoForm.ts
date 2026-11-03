import type { EventoBase } from "../../../services/eventosService";

/*
    La forma que tienen los datos del evento EN EL FORMULARIO, distinta a la de
    la API: todo es string, que es lo que devuelve cualquier input. Las fechas,
    la dirección y la capacidad ya no están acá: son de cada jornada.
*/
export type EventoFormData = {
    nombre: string;
    descripcion: string;
};

// Mismo patrón que CampoJornada: el atributo name de cada input tiene que coincidir con estas claves
export type CampoEvento = keyof EventoFormData;

export const eventoVacio = (): EventoFormData => ({
    nombre: "",
    descripcion: "",
});

// Camino inverso al del onSubmit: del evento que viene de la API a los valores de los inputs
export const eventoAFormulario = (evento: EventoBase): EventoFormData => ({
    nombre: evento.nombre,
    descripcion: evento.descripcion ?? "",
});
