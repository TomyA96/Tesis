import type { ColorEtiqueta } from "../../../ui/componentes/Etiqueta";
import type { EstadoTicket, Ticket } from "../../../services/ticketsService";

/*
    Cómo se lee cada estado en la pantalla. "Disponible" e "Impreso" son
    nombres técnicos: para el organizador uno está a la venta online y el
    otro lo tiene él en la mano.
*/
export const etiquetaEstadoTicket: Record<EstadoTicket, { texto: string; color: ColorEtiqueta }> = {
    Disponible:  { texto: "A la venta",  color: "azul" },
    Reservado:   { texto: "Reservado",   color: "ambar" },
    Impreso:     { texto: "En mano",     color: "indigo" },
    Asignado:    { texto: "Asignado",    color: "ambar" },
    Vendido:     { texto: "Vendido",     color: "verde" },
    Usado:       { texto: "Usado",       color: "verde" },
    Anulado:     { texto: "Anulado",     color: "rojo" },
    Reembolsado: { texto: "Reembolsado", color: "gris" },
};

/*
    Qué se puede hacer con lo que está seleccionado. Es la misma regla que
    valida el backend: acá solo sirve para apagar los botones que igual
    serían rechazados, y explicar por qué.
*/
export const accionesPosibles = (seleccion: Ticket[]) => {
    if (seleccion.length === 0) {
        return { asignar: false, quitar: false, anular: false };
    }
    return {
        // Asignar o reasignar: físicos en mano o ya asignados
        asignar: seleccion.every((t) => t.entrada.esFisica && (t.estado === "Impreso" || t.estado === "Asignado")),
        quitar: seleccion.every((t) => t.estado === "Asignado"),
        // Los que nadie tiene: online a la venta o físicos en mano
        anular: seleccion.every((t) => t.estado === "Disponible" || t.estado === "Impreso"),
    };
};

// "1 ticket" / "5 tickets"
export const tickets = (n: number) => `${n} ticket${n === 1 ? "" : "s"}`;
