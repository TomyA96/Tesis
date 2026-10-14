import type { Column } from "../../ui/componentes/GenericTable/GenericTable.types";
import type { GastoEvento, IngresoEvento } from "../../services/movimientoFinancieroService";
import { aFechaArgentina } from "../../utils/aFechaArg";
import { formatPrecio } from "../../utils/formatoPrecio";


export const columnasGastos: Column<GastoEvento>[] = [
    { 
        key: "fecha",
        label: "Fecha", 
        render: (value) => aFechaArgentina(String(value).split('T')[0]) 
    },
    { key: "rubro", label: "Rubro" },
    { key: "proveedor", label: "Proveedor" },
    { key: "nroFactura", label: "Nro. factura" },
    { key: "descripcion", label: "Descripción" },
    { 
        key: "monto", 
        label: "Monto", 
        render:(value) => formatPrecio(Number(value)) 
    },
];

export const columnasIngresos: Column<IngresoEvento>[] = [
    { 
        key: "fecha",
        label: "Fecha", 
        render: (value) => aFechaArgentina(String(value).split('T')[0])
    },
    { key: "rubro", label: "Rubro" },
    { key: "fuente", label: "Fuente" },
    { key: "nroFactura", label: "Nro. factura" },
    { key: "descripcion", label: "Descripción" },
    { 
        key: "monto", 
        label: "Monto", 
        render:(value) => formatPrecio(Number(value)) 
    },
];
