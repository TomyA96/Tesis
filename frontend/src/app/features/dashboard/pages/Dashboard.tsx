import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart2, CalendarDays, Home, PencilLine, Shield, Wrench } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import { useAuth } from "../../../context/AuthContext";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";

type Seccion = {
    nombre: string;
    descripcion: string;
    icono: ReactNode;
    href: string;
};

// Las mismas secciones, íconos y destinos que el menú lateral
const SECCIONES: Seccion[] = [
    {
        nombre: "Eventos",
        descripcion: "Eventos, jornadas, entradas y puntos de venta",
        icono: <CalendarDays className="h-6 w-6" />,
        href: RUTAS.eventos.inicio,
    },
    {
        nombre: "Operaciones",
        descripcion: "Accesos, venta de entradas y buffet de las jornadas en curso",
        icono: <Wrench className="h-6 w-6" />,
        href: RUTAS.operaciones.inicio,
    },
    {
        nombre: "Administración",
        descripcion: "Productos, proveedores, rubros y gastos de cada evento",
        icono: <PencilLine className="h-6 w-6" />,
        href: RUTAS.administracion.inicio,
    },
    {
        nombre: "Informes",
        descripcion: "Resumen anual y el informe de cada evento",
        icono: <BarChart2 className="h-6 w-6" />,
        href: RUTAS.informes.inicio,
    },
    {
        nombre: "Seguridad",
        descripcion: "Usuarios, perfiles y auditorías",
        icono: <Shield className="h-6 w-6" />,
        href: RUTAS.seguridad.inicio,
    },
];

/*
    Inicio del panel: un acceso directo a cada sección. Toda la tarjeta es
    el link (no solo el botón), así se puede hacer clic en cualquier parte.
*/
const Dashboard = () => {
    const { user } = useAuth();

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                icono={<Home />}
                seccion="Inicio"
                titulo={user?.nombre ? `Hola, ${user.nombre.split(" ")[0]}` : "Hola"}
            />

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {SECCIONES.map((seccion) => (
                    <Link
                        key={seccion.nombre}
                        to={seccion.href}
                        className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                            {seccion.icono}
                        </span>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-slate-900">{seccion.nombre}</h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">{seccion.descripcion}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                            Ir a {seccion.nombre}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </Link>
                ))}
            </section>
        </main>
    );
};

export default Dashboard;
