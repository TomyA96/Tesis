import Menu from "./Menu";  
import InfoUser  from "../componentes/InfoUser";
import Btn from "../componentes/Btn";
import { useState } from "react";
import { RUTAS } from "../../constantes/Rutas";
import { cn } from "../../../lib/cn";
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

import { NavLink } from "react-router-dom";

type SidebarSeccion = "seguridad" | "eventos" | "administración" | "informes" | "operaciones" | null;

const Sidebar = () => {
    const [activarSeccion, setActivarSeccion] = useState<SidebarSeccion>(null);
    const toggleSeccion = (seccion: SidebarSeccion) => {
        setActivarSeccion(prev => prev === seccion ? null : seccion);
    };
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
                    <NavLink
                        onClick={() => setActivarSeccion(null)}
                        to={RUTAS.inicio}
                        className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-md",
                            "text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-gray-200",
                            "transition-colors duration-150 cursor-pointer")}
                    >
                        <Home className="w-4 h-4 opacity-70" />
                        Inicio
                    </NavLink>
                </li>
                {/* ── SECCIONES ─────────────────────────────────────────── */}
                    <Menu
                        area="Seguridad"
                        icono={<Shield className="w-4 h-4" />}
                        isOpen={activarSeccion === "seguridad"}
                        onToggle={() => toggleSeccion("seguridad")}
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
                        isOpen={activarSeccion === "eventos"}
                        onToggle={() =>toggleSeccion("eventos")}
                        href={RUTAS.eventos.inicio}
                        opciones={[
                            {label: "Crear Evento", href: RUTAS.eventos.crear},
                        ]}
                    />
                    <Menu
                        area="Administración"
                        icono={<PencilLine  className="w-4 h-4" />}
                        isOpen={activarSeccion === "administración"}
                        onToggle={() => toggleSeccion("administración")}
                        href={RUTAS.administracion.inicio}
                        opciones={[
                            { label: "Productos", href: RUTAS.administracion.productos },
                            { label: "Proveedores", href: RUTAS.administracion.proveedores },
                            { label: "Rubros", href: RUTAS.administracion.rubros }
                        ]}
                    />
                    <Menu
                        area="Informes"
                        icono={<BarChart2 className="w-4 h-4" />}
                        isOpen={activarSeccion === "informes"}
                        href={RUTAS.informes.inicio}
                        onToggle={( ) =>toggleSeccion("informes")}
                        opciones={[
                            { label: "Resumen anual", href: RUTAS.informes.resumenAnual }
                        ]}
                    />
                    <Menu
                        area="Operaciones"
                        icono={<Wrench className="w-4 h-4" />}
                        isOpen={activarSeccion === "operaciones"}
                        href={RUTAS.eventos.inicio}
                        onToggle={() => toggleSeccion("operaciones")}
                        opciones={[
                            { label: "Seleccionar evento", href: RUTAS.eventos.inicio }
                        ]}
                    />

                
            </ul>
        </nav>
        <div className="border-t border-white/5 p-4 space-y-3">
                <InfoUser username="Andres Gomez" perfil="Administrador" />
                <Btn
                    variant="danger"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {}}
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </Btn>
            </div>
    </aside>
    );
}

export default Sidebar;
