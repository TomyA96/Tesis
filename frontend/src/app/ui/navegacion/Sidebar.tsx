import Menu from "./Menu";  
import { InfoUser } from "../componentes/InfoUser";
import Btn from "../componentes/Btn";
import { useState } from "react";

type SidebarSeccion = "seguridad" | "eventos" | "administración" | "informes" | "operaciones" | null;

const Sidebar = () => {
    const [activarSeccion, setActivarSeccion] = useState<SidebarSeccion>(null);
    return (
    <aside className="bg-gray-950 w-60 text-amber-50 h-screen flex flex-col font-sans">
        <header>
            <h1 className="text-3xl font-bold p-4 border-b border-gray-700">El Arañado</h1>
        </header>
        <nav>
            
            <ul>
                <li className="text-x1 font-bold p-2 pl-8 cursor-pointer w-full  hover:bg-neutral-700" onClick={() => setActivarSeccion(null)}>Inicio</li>
                <Menu 
                    area="Seguridad" 
                    isOpen={activarSeccion === "seguridad"}
                    onToggle={() => setActivarSeccion("seguridad")}
                    opciones={[
                    
                    {label: "Usuarios", onClick: () => {}},
                    {label: "Perfiles", onClick: () => {}},
                    {label: "Actividad de usuarios", onClick: () => {}}
                ]}/>
                <Menu
                    area="Eventos"
                    isOpen={activarSeccion === "eventos"}
                    onToggle={() => setActivarSeccion("eventos")}
                    opciones={[
                    
                    {label: "Listado de eventos", onClick: () => {}},
                    {label: "Crear Evento", onClick: () => {}}
                        
                    ]}
                />
                <Menu
                    area="Administración"
                    isOpen={activarSeccion === "administración"}
                    onToggle={() => setActivarSeccion("administración")}
                    opciones={[
                    
                    {label: "Listado de eventos", onClick: () => {}},
                    {label: "Productos", onClick: () => {}},
                    {label: "Proveedores", onClick: () => {}},
                    {label: "Rubros", onClick: () => {}}
                        
                    ]}
                />
                <Menu
                    area="Informes"
                    isOpen={activarSeccion === "informes"}
                    onToggle={() => setActivarSeccion("informes")}
                    opciones={[
                    
                    {label: "Listado de eventos", onClick: () => {}}
                    
                        
                    ]}
                />
                <Menu
                    area="Operaciones"
                    isOpen={activarSeccion === "operaciones"}
                    onToggle={() => setActivarSeccion("operaciones")}
                    opciones={[
                    {label: "Inicio", onClick: () => {}},
                    {label: "Registro de ventas", onClick: () => {}},
                    {label: "Control de ingreso", onClick: () => {}},
                    {label: "Venta de entradas", onClick: () => {}}
                        
                    ]}
                />

                
            </ul>
        </nav>
        <div className="mt-auto mb-10">
            <InfoUser username="Andres Gomez" perfil="Administrador"/>
            <Btn 
                variant="danger" 
                size="lg" 
                className="w-5/6 m-auto block text-center mt-4 cursor-pointer"
                onClick={() => {}}
            >
                Cerrar Sesion
            </Btn>
        </div>
    </aside>
    );
}

export default Sidebar;