import { useOutletContext } from "react-router-dom";
import type { InformeEvento, InformeJornada, TipoProducto } from "../../services/informesService";

/*
    Lo que InformeEventoLayout le pasa a cada pestaña: el informe (se pide una
    sola vez) y la jornada elegida en el selector. La elección queda en el
    layout, así se mantiene al pasar de Entradas a Buffet. null = todas.
*/
export type ContextoInformeEvento = {
    informe: InformeEvento;
    idJornada: number | null;
    setIdJornada: (id: number | null) => void;
};

export const useInformeEvento = () => useOutletContext<ContextoInformeEvento>();

// "Noche 1", o la fecha si la jornada no tiene nombre
export const nombreDeJornada = (j: Pick<InformeJornada, "nombre" | "fechaHoraInicio">) =>
    j.nombre || new Date(j.fechaHoraInicio).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });

export const jornadasElegidas = (informe: InformeEvento, idJornada: number | null) =>
    idJornada === null ? informe.jornadas : informe.jornadas.filter((j) => j.id === idJornada);

const sumar = <T,>(lista: T[], valor: (item: T) => number) => lista.reduce((suma, item) => suma + valor(item), 0);

/*
    Junta las entradas de varias jornadas: los totales se suman, los canales
    se juntan por nombre (Online de cada noche es el mismo canal) y los lotes
    se listan todos, con su jornada al lado. La capacidad no cuenta jornadas
    canceladas: esos lugares nunca existieron.
*/
export const combinarEntradas = (jornadas: InformeJornada[]) => {
    const canales = new Map<string, InformeJornada["entradas"]["canales"][number]>();
    for (const c of jornadas.flatMap((j) => j.entradas.canales)) {
        const actual = canales.get(c.canal);
        canales.set(c.canal, actual ? { ...actual, cantidad: actual.cantidad + c.cantidad, monto: actual.monto + c.monto } : c);
    }
    return {
        capacidad: sumar(jornadas.filter((j) => j.estado !== "Cancelado"), (j) => j.capacidad),
        emitidas: sumar(jornadas, (j) => j.entradas.emitidas),
        vendidas: sumar(jornadas, (j) => j.entradas.vendidas),
        vendidasSinUsar: sumar(jornadas, (j) => j.entradas.vendidasSinUsar),
        asistentes: sumar(jornadas, (j) => j.entradas.asistentes),
        recaudado: sumar(jornadas, (j) => j.entradas.recaudado),
        canales: [...canales.values()].sort((a, b) => b.cantidad - a.cantidad),
        lotes: jornadas.flatMap((j) => j.entradas.lotes.map((l) => ({ ...l, jornada: nombreDeJornada(j) }))),
        pendienteRendir: {
            tickets: sumar(jornadas, (j) => j.entradas.pendienteRendir.tickets),
            monto: sumar(jornadas, (j) => j.entradas.pendienteRendir.monto),
        },
    };
};

/*
    Las horas se ordenan como transcurre una noche: desde las 6 de la mañana
    en adelante, así las 23 hs quedan antes que la 1 hs del día siguiente.
*/
const ordenNocturno = (hora: number) => (hora - 6 + 24) % 24;

// Junta el buffet de varias jornadas: productos por id y franjas por hora
export const combinarBuffet = (jornadas: InformeJornada[]) => {
    const productos = new Map<number, { id: number; nombre: string; tipo: TipoProducto; cantidad: number; total: number }>();
    for (const p of jornadas.flatMap((j) => j.buffet.productos)) {
        const actual = productos.get(p.id);
        productos.set(p.id, actual ? { ...actual, cantidad: actual.cantidad + p.cantidad, total: actual.total + p.total } : p);
    }
    const porHora = new Map<number, { hora: number; comida: number; bebida: number }>();
    for (const f of jornadas.flatMap((j) => j.buffet.porHora)) {
        const actual = porHora.get(f.hora);
        porHora.set(f.hora, actual ? { ...actual, comida: actual.comida + f.comida, bebida: actual.bebida + f.bebida } : f);
    }
    const lista = [...productos.values()].sort((a, b) => b.total - a.total);
    return {
        ventas: sumar(jornadas, (j) => j.buffet.ventas),
        total: sumar(jornadas, (j) => j.buffet.total),
        comidas: lista.filter((p) => p.tipo === "Comida"),
        bebidas: lista.filter((p) => p.tipo === "Bebida"),
        porHora: [...porHora.values()].sort((a, b) => ordenNocturno(a.hora) - ordenNocturno(b.hora)),
    };
};
