import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { useState } from "react";
import EventoForm from "../forms/EventoForm";
import ListaEntradas from "../componentes/ListaEntradas";
import { Link } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
export type ModoEventoPage = "crear" | "ver" | "editar";
type EventoEstado = "activo"  | "borrador" | "finalizado" | "cancelado";


type EventoPageProps = {
    modo: ModoEventoPage;
    estadoEvento: EventoEstado;
}
type BotonesEvento ={
    label: string;
    variant: "secondary" | "ghost" | "warning" | "success" | "danger";
    onClick?: () => void;
}

const EventoPage = ({modo="crear", estadoEvento="borrador"}: EventoPageProps) => {
    //Creo el objeto para renderizar los botones según el estado del evento
    
    const accionesPorEstado: Record<EventoEstado, BotonesEvento[]> = {
        activo: [
            { label: "Editar", variant: "secondary", onClick: () => setModoPage("editar") },
            { label: "Finalizar", variant: "ghost" },
            { label: "Suspender", variant: "warning" },
        ],
        borrador: [
            { label: "Editar", variant: "secondary", onClick: () => setModoPage("editar") },
            { label: "Publicar", variant: "success"},
            { label: "Eliminar", variant: "danger" },
        ],
        finalizado: [],
        cancelado: [],
        //Finalizado y cancelado no tienen acciones porque no se pueden modificar
        
    };
    const [modoPage, setModoPage] = useState<ModoEventoPage>(modo);
    console.log("Modo de la página:", modoPage);
    const nombreEvento =" Expo Tecnología 2026"; // Este valor debería venir de las props o del estado
    const acciones = accionesPorEstado[estadoEvento];
    const contenidoHeader = (modoPage === "crear") ? <h1 className="text-2xl">"Crear Evento"</h1> : 
    <div className="h-fit">
        <h1 className="text-2xl font-bold">Evento: {nombreEvento}</h1>
        <h1 className="text-2x1 font-medium text-gray-500">Estado: {estadoEvento}</h1>
    </div>;
    
    
    return (
        <main >
            <ContenedorDatos className="mb-4">
                <Header 
                titulo={
                    contenidoHeader
                }
                action={acciones.length &&  (
                    <div className="flex gap-8">
                        
                        {acciones.map((accion) => (
                            <Btn key={accion.label}
                                variant={accion.variant}
                                className="min-w-[110px]"
                                onClick={accion.onClick}
                                >{accion.label}
                            </Btn>   
                        ))}

                    </div>
                    )}/>
            </ContenedorDatos>
            
                
                {/*action={estadoEvento === "activo" ? 
                    <div className="flex gap-8">
                        <Btn variant="secondary" className="min-w-[110px]">Editar</Btn>
                        <Btn variant="ghost" className="min-w-[110px]">Finalizar</Btn>
                        <Btn variant="warning" className="min-w-[110px]">Suspender</Btn>
                    </div>
                    :
                    estadoEvento === "pendiente" ? 
                    <div className="flex gap-8">
                        <Btn variant="secondary" className="min-w-[110px]">Editar</Btn>
                        <Btn variant="success" className="min-w-[110px]">Publicar</Btn>
                        <Btn variant="danger" className="min-w-[110px]">Eliminar</Btn>

                    </div>
                    :
                    ""
                }*/}
            
            <div className="grid grid-cols-2 gap-6">
                <ContenedorDatos>
                    <EventoForm modo="crear"/>
                </ContenedorDatos>
                <ContenedorDatos >
                    <ListaEntradas />            
                </ContenedorDatos>
                <div>
                    <Link to={RUTAS.eventos.ventas(2)} className="mt-4 min-w-[150px]">Ver Ventas</Link>
                </div>  
            </div>   
        </main>
    );
}
export default EventoPage;