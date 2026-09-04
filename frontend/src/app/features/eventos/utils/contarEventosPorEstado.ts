import { ESTADOS_EVENTO, type EstadoEvento, type Evento } from "../../../services/eventosService";

export const contarEventosPorEstado = (eventos: Evento[]): Record<EstadoEvento, number> => {
    const conteoInicialEnCero = ESTADOS_EVENTO.reduce((acc, estado) => {
        acc[estado] = 0;
        return acc;
    }, {} as Record<EstadoEvento, number>);

    return eventos.reduce((acc, evento) => {
        acc[evento.estado]++;
        return acc;
    }, conteoInicialEnCero);
};
