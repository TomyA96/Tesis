import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type EncabezadoPaginaProps = {
    // El mismo ícono que tiene la sección en el menú lateral
    icono: ReactNode;
    // En qué sección estás, en chico arriba del título (ej: "Administración")
    seccion: string;
    titulo: ReactNode;
    // Al lado del título, por ejemplo el estado de un evento
    etiqueta?: ReactNode;
    // Una línea de datos debajo del título (fechas, lugar)
    detalle?: ReactNode;
    // A la derecha: botones, el selector de año, etc.
    acciones?: ReactNode;
    // Link para volver, arriba del encabezado (ej: del detalle de algo a su listado)
    volver?: { to: string; label: string };
};

// "← Eventos": para volver del detalle de algo a su listado. Lo usan también las cabeceras propias (detalle de evento y de jornada)
export const LinkVolver = ({ to, label }: { to: string; label: string }) => (
    <Link to={to} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        {label}
    </Link>
);

/*
    Encabezado de todas las pantallas del panel, para que se vean de la
    misma familia: tarjeta blanca con el ícono de la sección, la sección en
    chico y el título grande. Va arriba de todo, separado de las tablas y
    tarjetas de la página (que tienen sus propios títulos con Header).
*/
const EncabezadoPagina = ({ icono, seccion, titulo, etiqueta, detalle, acciones, volver }: EncabezadoPaginaProps) => (
    <div className="flex flex-col gap-3">
        {volver && <LinkVolver to={volver.to} label={volver.label} />}
        <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 [&>svg]:h-6 [&>svg]:w-6">
                {icono}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{seccion}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{titulo}</h1>
                    {etiqueta}
                </div>
                {detalle && <p className="mt-1 text-sm text-slate-500">{detalle}</p>}
            </div>
            {acciones && <div className="flex flex-wrap items-center gap-3">{acciones}</div>}
        </header>
    </div>
);

export default EncabezadoPagina;
