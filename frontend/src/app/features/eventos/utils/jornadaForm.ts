import type { CreateJornada, Jornada } from "../../../services/jornadasService";
import { calcularDuracionHoras, combinarFechaHora, fechaAInputs, sumarDuracion } from "./fechaHora";

/*
    La forma que tiene una jornada EN EL FORMULARIO, distinta a la de la API:
    todo es string (es lo que devuelve cualquier input) y el fin se maneja
    como duración en horas en vez de como una segunda fecha. Es la misma idea
    que EventoFormData, pero esta se repite una vez por cada fila.
*/
export type JornadaFormData = {
    // Solo existe en el front: sirve de key de React y para armar ids únicos de inputs
    idLocal: string;
    nombre: string;
    direccion: string;
    fecha: string;
    hora: string;
    duracion: string;
    capacidad: string;
};

// Los campos que escribe el usuario: idLocal no se edita
export type CampoJornada = Exclude<keyof JornadaFormData, "idLocal">;

/*
    Contador que solo sube: nunca repite un id, aunque se borren filas (usar el
    índice del array sí los repetiría). Se reinicia al recargar la página, pero
    las jornadas sin guardar tampoco sobreviven a eso. A diferencia de
    crypto.randomUUID, no depende de https y no tiene probabilidad de choque.
*/
let contadorIdLocal = 0;
const nuevoIdLocal = () => `jornada-${++contadorIdLocal}`;

// Una fila sin ningún dato cargado, como la que trae el formulario al abrirse
export const estaVacia = (jornada: JornadaFormData) =>
    (["nombre", "direccion", "fecha", "hora", "duracion", "capacidad"] as const).every(
        (campo) => jornada[campo].trim() === "",
    );

/*
    Ordena por fecha y hora, devolviendo un array NUEVO (sort modifica el que
    recibe). "AAAA-MM-DD" y "HH:mm" ordenan bien como texto, sin pasar por
    Date. Las filas sin fecha quedan al final.
*/
export const ordenarJornadas = (jornadas: JornadaFormData[]) =>
    [...jornadas].sort((a, b) => {
        if (!a.fecha && !b.fecha) return 0;
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`);
    });

// Los nombres que arma el generador ("Día 3", "Fecha 2"); cualquier otro lo escribió el usuario
const NOMBRE_AUTOMATICO = /^(Día|Fecha) \d+$/;

/*
    Ordena por fecha y vuelve a numerar según la posición. Solo toca los
    nombres automáticos: uno escrito a mano ("Semifinal") se respeta, aunque
    cuenta para la numeración de las que siguen.
*/
export const renumerarJornadas = (jornadas: JornadaFormData[]) =>
    ordenarJornadas(jornadas).map((jornada, indice) => {
        const automatico = NOMBRE_AUTOMATICO.exec(jornada.nombre.trim());
        return automatico ? { ...jornada, nombre: `${automatico[1]} ${indice + 1}` } : jornada;
    });

// Cuándo empieza y termina una fila; null si todavía no tiene los datos para saberlo
const intervaloDe = (jornada: JornadaFormData) => {
    const horas = Number(jornada.duracion);
    if (!jornada.fecha || !jornada.hora || !(horas > 0)) return null;
    const inicio = combinarFechaHora(jornada.fecha, jornada.hora);
    return { inicio, fin: sumarDuracion(inicio, horas) };
};

/*
    Busca jornadas que se pisan en el tiempo. Devuelve las posiciones (en el
    array recibido) de cada par que choca, vacío si no hay ninguna. Dos
    jornadas se superponen si cada una empieza antes de que termine la otra;
    que una termine justo cuando empieza la otra no cuenta. Las filas
    incompletas se ignoran: de eso se encargan las otras validaciones.
*/
export const hallarSuperposiciones = (jornadas: JornadaFormData[]): [number, number][] => {
    const intervalos = jornadas.map(intervaloDe);
    const choques: [number, number][] = [];

    for (let i = 0; i < intervalos.length; i++) {
        for (let j = i + 1; j < intervalos.length; j++) {
            const a = intervalos[i];
            const b = intervalos[j];
            if (a && b && a.inicio < b.fin && b.inicio < a.fin) {
                choques.push([i, j]);
            }
        }
    }
    return choques;
};

export const jornadaVacia = (): JornadaFormData => ({
    idLocal: nuevoIdLocal(),
    nombre: "",
    direccion: "",
    fecha: "",
    hora: "",
    duracion: "",
    capacidad: "",
});

/*
    De la jornada que viene de la API a los valores que necesitan los inputs.
    Es el camino inverso a formularioAJornada. Las fechas llegan como string
    ISO, así que primero se pasan a Date.
*/
export const jornadaAFormulario = (jornada: Jornada): JornadaFormData => {
    const inicio = new Date(jornada.fechaHoraInicio);
    const fin = new Date(jornada.fechaHoraFin);
    const { fecha, hora } = fechaAInputs(inicio);

    return {
        idLocal: nuevoIdLocal(),
        nombre: jornada.nombre ?? "",
        direccion: jornada.direccion,
        fecha,
        hora,
        duracion: calcularDuracionHoras(inicio, fin),
        capacidad: String(jornada.capacidad),
    };
};

/*
    De los valores del formulario a lo que espera el backend. Asume que los
    datos ya fueron validados: acá solo se convierte, no se controla nada.
*/
export const formularioAJornada = (datos: JornadaFormData): CreateJornada => {
    const inicio = combinarFechaHora(datos.fecha, datos.hora);
    const nombre = datos.nombre.trim();

    return {
        // Vacío se manda como undefined: el backend lo toma como "sin nombre"
        nombre: nombre === "" ? undefined : nombre,
        direccion: datos.direccion.trim(),
        fechaHoraInicio: inicio,
        fechaHoraFin: sumarDuracion(inicio, Number(datos.duracion)),
        capacidad: Number(datos.capacidad),
    };
};
