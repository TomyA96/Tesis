import type { EventoEstado } from "../features/eventos/componentes/FiltroEventos";

 export  const meses = [
    {label: "Todos", value: 0 },
    { label: "Enero", value: 1 },
    { label: "Febrero", value: 2 },
    { label: "Marzo", value: 3 },
    { label: "Abril", value: 4 },
    { label: "Mayo", value: 5 },
    { label: "Junio", value: 6 },
    { label: "Julio", value: 7 },
    { label: "Agosto", value: 8 },
    { label: "Septiembre", value: 9 },
    { label: "Octubre", value: 10 },
    { label: "Noviembre", value: 11 },
    { label: "Diciembre", value: 12 },
];
export const estados: { label: string; value: EventoEstado | "" }[] = [
    { label: "Todos", value: "" },
    { label: "Activo", value: "activo" },
    { label: "Finalizado", value: "finalizado" },
    { label: "Pendiente", value: "pendiente" },
    { label: "Cancelado", value: "cancelado" },
];