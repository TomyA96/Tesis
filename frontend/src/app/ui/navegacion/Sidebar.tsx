import Menu from "./Menu";  
import InfoUser  from "../componentes/InfoUser";
import Btn from "../componentes/Btn";
import { RUTAS } from "../../constantes/Rutas";
import { cn } from "../../../lib/cn";
import { useAuth } from "../../context/AuthContext";
// Importamos íconos de lucide-react 
//npm install lucide-react
import {
    Shield,
    CalendarDays,
    PencilLine ,
    BarChart2,
    Wrench,
    Home,
    LogOut
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

type SidebarSeccion = "seguridad" | "eventos" | "administración" | "informes" | "operaciones" | null;

/*
    A qué sección pertenece la página que se está viendo. La URL es la que
    decide qué sección se pinta y se abre: así queda bien también al
    recargar, o al llegar desde un link de otra pantalla. Algunas páginas
    viven bajo /admin/eventos/:id pero son de otro módulo (el informe y la
    administración de un evento), por eso se miran antes que Eventos.
*/
const seccionDe = (ruta: string): SidebarSeccion => {
    if (ruta.startsWith("/admin/seguridad")) return "seguridad";
    if (ruta.startsWith("/admin/informes") || /^\/admin\/eventos\/[^/]+\/informes/.test(ruta)) return "informes";
    if (ruta.startsWith("/admin/administracion") || /^\/admin\/eventos\/[^/]+\/administracion/.test(ruta)) return "administración";
    if (ruta.startsWith("/admin/operaciones")) return "operaciones";
    if (ruta.startsWith("/admin/eventos")) return "eventos";
    return null;
};

const Sidebar = () => {
    // Solo una sección abierta a la vez: la de la página actual. Volver a tocarla lleva a su inicio sin cerrarla.
    const seccionActual = seccionDe(useLocation().pathname);

    const { logout, user } = useAuth();

    return (
    <aside className="bg-gray-950
            w-64                        
            h-screen
            flex flex-col
            border-r border-white/5 ">
        <header>
            <div className="flex items-center gap-2.5">
                    {/* Punto de color — reemplaza un logo por ahora, fácil de cambiar */}
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center ">
                        <span className="text-white text-xs font-bold">EA</span>
                    </div>
                    <div>
                        <h1 className="text-white text-sm font-bold leading-tight">El Arañado</h1>
                        {/* Subtítulo — le da contexto al sistema */}
                        <p className="text-gray-500 text-xs">Sistema de Eventos</p>
                    </div>
                </div>
        </header>
        {/* ── NAVEGACIÓN ───────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
            
            <ul className="space-y-0.5">
                <li>
                    {/* end: solo está activo en /admin exacto, no en todas las páginas que empiezan con /admin */}
                    <NavLink
                        end
                        to={RUTAS.admin.inicio}
                        className={({ isActive }) => cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-md",
                            "text-sm font-semibold transition-colors duration-150 cursor-pointer",
                            isActive ? "bg-white/[0.06] text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200")}
                    >
                        {({ isActive }) => (
                            <>
                                <Home className={cn("w-4 h-4 transition-opacity", isActive ? "opacity-100" : "opacity-70")} />
                                Inicio
                            </>
                        )}
                    </NavLink>
                </li>
                {/* ── SECCIONES ─────────────────────────────────────────── */}
                    <Menu
                        area="Seguridad"
                        icono={<Shield className="w-4 h-4" />}
                        activa={seccionActual === "seguridad"}
                        href={RUTAS.seguridad.inicio}
                        opciones={[
                            { label: "Usuarios", href: RUTAS.seguridad.usuarios },
                            { label: "Perfiles", href: RUTAS.seguridad.perfiles },
                            { label: "Auditorias", href: RUTAS.seguridad.auditorias }
                        ]}
                    />
                    <Menu
                        area="Eventos"
                        icono={<CalendarDays className="w-4 h-4" />}
                        activa={seccionActual === "eventos"}
                        href={RUTAS.eventos.inicio}
                        opciones={[
                            {label: "Crear Evento", href: RUTAS.eventos.crear},
                            {label: "Puntos de venta", href: RUTAS.eventos.puntosVenta},
                        ]}
                    />
                    <Menu
                        area="Administración"
                        icono={<PencilLine  className="w-4 h-4" />}
                        activa={seccionActual === "administración"}
                        href={RUTAS.administracion.inicio}
                        opciones={[
                            { label: "Productos", href: RUTAS.administracion.productos },
                            { label: "Proveedores", href: RUTAS.administracion.proveedores },
                            { label: "Fuentes de ingreso", href: RUTAS.administracion.fuentesIngreso },
                            { label: "Rubros", href: RUTAS.administracion.rubros }
                        ]}
                    />
                    {/*
                        Informes y Operaciones tienen una sola pantalla de inicio: van
                        sin submenú (una opción que repite el botón de arriba confunde).
                        Cuando sumen otra pantalla, se le pasan opciones y el submenú aparece.
                    */}
                    <Menu
                        area="Informes"
                        icono={<BarChart2 className="w-4 h-4" />}
                        activa={seccionActual === "informes"}
                        href={RUTAS.informes.inicio}
                    />
                    <Menu
                        area="Operaciones"
                        icono={<Wrench className="w-4 h-4" />}
                        activa={seccionActual === "operaciones"}
                        href={RUTAS.operaciones.inicio}
                    />

                
            </ul>
        </nav>
        <div className="border-t border-white/5 p-4 space-y-3">
                <InfoUser username={user?.nombre ?? ""} perfil="Administrador" />
                <Btn
                    variant="danger"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => { logout(); }}
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </Btn>
            </div>
    </aside>
    );
}

export default Sidebar;
