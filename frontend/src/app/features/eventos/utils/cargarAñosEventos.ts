import type { Evento } from "../../../services/eventosService";

export const cargarAñosEventos = (eventos: Evento[], añoActual: number) => {
    const añosSet = new Set<number>();
    eventos.forEach(evento => {
        const año = new Date(evento.fechaHoraInicio).getFullYear();
        añosSet.add(año);
    })
    añosSet.add(añoActual); // Asegura que el año actual siempre esté incluido
    return Array.from(añosSet).sort((a, b) => b - a); // Ordena de mayor a menor
}