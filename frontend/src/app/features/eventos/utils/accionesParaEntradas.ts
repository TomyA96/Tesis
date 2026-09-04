import type { Entrada } from "../../../services/entradasService";
import type { EstadoEvento } from "../../../services/eventosService";

export type AccionEntrada = "editar" | "publicar" | "imprimir" | "habilitar" | "deshabilitar" | "eliminar";


export const accionesDeEntradas = (estadoEvento:EstadoEvento, entrada:Entrada, tieneTickets:boolean,): AccionEntrada[] => {
    
    if(estadoEvento === "Finalizado" || estadoEvento ==="Cancelado"){
        return []
    }
    if (entrada.esFisica && tieneTickets){
        return []
    }
    const acciones: AccionEntrada[] = [];
    const puedeEditar = !(estadoEvento === "Activo" && entrada.estado === "Disponible")
    const puedePublicar = (estadoEvento === "Activo" && entrada.estado === "Borrador" && entrada.habilitada)
    const puedeEliminar = (entrada.estado === "Borrador") || (!tieneTickets && !entrada.habilitada)
    const puedeImprimir = (entrada.esFisica && entrada.habilitada && estadoEvento === "Activo" && entrada.estado === "Disponible")
    if (puedeImprimir){
        acciones.push("imprimir")
    }
    if (puedeEditar){
        acciones.push("editar")
    }
    if (puedePublicar){
        acciones.push("publicar")
    }
    
    if (entrada.habilitada){
        acciones.push("deshabilitar")
    }else{
        acciones.push("habilitar")
    }
    if (puedeEliminar){
        acciones.push("eliminar")
    }
    return acciones
}