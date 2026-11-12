import type { Entrada } from "../../../services/entradasService";
import type { EstadoEvento } from "../../../services/eventosService";

export type AccionEntrada = "editar" | "publicar" | "imprimir" | "habilitar" | "deshabilitar" | "anular" | "tickets" | "eliminar";

/*
    Qué se puede hacer con un lote según su estado y el de su jornada:

    - Borrador: todavía no tiene tickets. Se edita o se elimina, y se
      publica (online) o se imprime (física) cuando la jornada está activa.
      Habilitar/deshabilitar no aplica: no está a la venta.
    - Online publicado: se pausa (deshabilitar) o se reanuda la venta. Con
      la venta pausada aparece anular, que reemplaza a eliminar porque ya
      tiene tickets. Los tickets online son todos iguales: no se manejan
      sueltos, siempre el lote entero.
    - Física impresa (o anulada): "Ver tickets" lleva a la pantalla de
      tickets del evento, donde se entregan a los locales, se corrigen y
      se anulan. Con la jornada cerrada sigue estando, para consultarlos.
*/
export const accionesDeEntradas = (estadoJornada: EstadoEvento, entrada: Entrada): AccionEntrada[] => {
    const jornadaCerrada = estadoJornada === "Finalizado" || estadoJornada === "Cancelado";

    if (entrada.estado === "Borrador") {
        if (jornadaCerrada) return [];
        const acciones: AccionEntrada[] = ["editar"];
        if (estadoJornada === "Activo") {
            acciones.push(entrada.esFisica ? "imprimir" : "publicar");
        }
        acciones.push("eliminar");
        return acciones;
    }

    if (entrada.esFisica) {
        return ["tickets"];
    }
    if (jornadaCerrada || entrada.estado === "Anulado") {
        return [];
    }
    return entrada.habilitada ? ["deshabilitar"] : ["habilitar", "anular"];
};
