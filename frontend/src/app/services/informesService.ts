import { api } from "./api";
import type { EstadoEvento } from "./eventosService";

/*
    A diferencia de otros servicios, acá los montos llegan como number y no
    como string: el backend ya los redondea a centavos para que los gráficos
    los usen directo. Los porcentajes vienen con un decimal, y son null
    cuando no hay sobre qué calcularlos (capacidad o recaudación en cero).
*/

export interface OcupacionJornada {
    id: number;
    nombre: string | null;
    fechaHoraInicio: string;
    asistentes: number;
    capacidad: number;
    porcentaje: number | null;
}

export interface EventoResumen {
    id: number;
    nombre: string;
    estado: EstadoEvento;
    fechaInicio: string;
    fechaFin: string;
    entradasVendidas: number;
    asistentes: number;
    recaudadoEntradas: number;
    recaudadoBuffet: number;
    otrosIngresos: number;
    gastos: number;
    comisiones: number;
    recaudado: number;
    gastado: number;
    ganancia: number;
    // Solo de las jornadas ya realizadas; el detalle de cada una es para desplegar el gráfico
    ocupacion: {
        asistentes: number;
        capacidad: number;
        porcentaje: number | null;
        jornadas: OcupacionJornada[];
    };
    // Ganó: % de lo ganado en el año. Perdió: negativo, % de lo perdido.
    contribucion: number;
}

export interface ResumenAnual {
    anio: number;
    totales: {
        recaudado: number;
        entradas: number;
        buffet: number;
        otrosIngresos: number;
        gastado: number;
        gastos: number;
        comisiones: number;
        ganancia: number;
        margen: number | null;
        // Tickets que los locales todavía no rindieron: el monto es lo máximo que podría entrar
        pendienteRendir: { tickets: number; monto: number };
    };
    eventos: EventoResumen[];
}

// ── Informe de un evento ────────────────────────────────────────────────

export type CanalVenta = "Online" | "Local" | "Puerta";
export type TipoProducto = "Comida" | "Bebida";

export interface InformeJornada {
    id: number;
    nombre: string | null;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    direccion: string;
    capacidad: number;
    estado: EstadoEvento;
    // Ya se hizo (cerrada, o activa con la fecha de fin pasada): solo esas cuentan para la ocupación
    realizada: boolean;
    entradas: {
        emitidas: number;
        vendidas: number;
        vendidasSinUsar: number;
        asistentes: number;
        recaudado: number;
        // canal: "Online", el nombre del local que la rindió, o "Venta en puerta"
        canales: { canal: string; tipo: CanalVenta; cantidad: number; monto: number }[];
        lotes: { id: number; descripcion: string; esFisica: boolean; esBoleteria: boolean; precio: number; emitidas: number; vendidas: number; recaudado: number }[];
        pendienteRendir: { tickets: number; monto: number };
    };
    buffet: {
        ventas: number;
        total: number;
        productos: { id: number; nombre: string; tipo: TipoProducto; cantidad: number; total: number }[];
        // hora: 0 a 23, en hora argentina
        porHora: { hora: number; comida: number; bebida: number }[];
    };
}

export interface MovimientoInforme {
    id: number;
    fecha: string;
    rubro: string;
    // De quién vino el ingreso (fuente) o a quién se le pagó el gasto (proveedor)
    origen: string | null;
    descripcion: string | null;
    nroFactura: string | null;
    monto: number;
}

export interface InformeEvento {
    evento: {
        id: number;
        nombre: string;
        descripcion: string | null;
        estado: EstadoEvento;
        fechaInicio: string | null;
        fechaFin: string | null;
        direcciones: string[];
        capacidad: number;
    };
    jornadas: InformeJornada[];
    // Del evento completo: los gastos, los otros ingresos y las rendiciones no se cargan por jornada
    finanzas: {
        entradas: number;
        buffet: number;
        otrosIngresos: number;
        recaudado: number;
        gastos: number;
        comisiones: number;
        gastado: number;
        ganancia: number;
        margen: number | null;
        ingresos: MovimientoInforme[];
        gastosDetalle: MovimientoInforme[];
        comisionesPorLocal: { idPuntoVenta: number; puntoVenta: string; monto: number }[];
    };
}

export const getAniosConEventos = () => api.get<number[]>("/informes/anios");

export const getInformeEvento = (idEvento: number | string) => api.get<InformeEvento>(`/informes/eventos/${idEvento}`);

export const getResumenAnual = (anio: number) => api.get<ResumenAnual>(`/informes/resumen-anual?anio=${anio}`);
