import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { useEffect, useState } from "react";
import EventoForm from "../forms/EventoForm";
import ListaEntradas from "../componentes/ListaEntradas";
import { Link, useParams } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import { getEvento } from "../../../services/eventosService";
import type { Evento, EstadoEvento } from "../../../services/eventosService";
import { useNavigate } from "react-router-dom";


export type ModoEventoPage = "crear" | "ver" | "editar";


type BotonesEvento ={
    label: string;
    variant: "secondary" | "ghost" | "warning" | "success" | "danger";
    onClick?: () => void;
}



const EventoPage = () => {
    const {idEvento} = useParams()
    const navigate = useNavigate();
    /*
        El único estado real es "¿el usuario tocó Editar?". Si estamos creando
        o viendo se deriva de la URL en cada render, así no puede quedar
        desincronizado al navegar entre /eventos/crear y /eventos/:id.
    */
    const [editando, setEditando] = useState(false);
    const modoPage: ModoEventoPage = !idEvento ? "crear" : editando ? "editar" : "ver";
    const [evento, setEvento] = useState<Evento | null>(null)
    const [error, setError] = useState("")
    
    
    const accionesPorEstado: Record<EstadoEvento, BotonesEvento[]> = {
        Activo: [
            { label: "Editar", variant: "secondary", onClick: () => setEditando(true) },
            { label: "Finalizar", variant: "ghost" },
            { label: "Suspender", variant: "warning" },
        ],
        Borrador: [
            { label: "Editar", variant: "secondary", onClick: () => setEditando(true) },
            { label: "Publicar", variant: "success"},
           
        ],
        Suspendido:[
            {label: "Reprogramar", variant: "warning", onClick: ()=> {}}
        ],
        Finalizado: [],
        Cancelado: [],
        //Finalizado y cancelado no tienen acciones porque no se pueden modificar
        
    };
    
    useEffect(() => {
        /*
            Al cambiar de evento (o volver a "crear") arrancamos siempre en
            modo lectura: React reutiliza esta instancia entre rutas, así que
            si no lo reseteamos, "editando" quedaría prendido del evento anterior.
        */
        setEditando(false);
        setEvento(null);  

        if (!idEvento) return;
        getEvento(Number(idEvento))
            .then((eventoBuscado) => (setEvento(eventoBuscado)))
            .catch(() => setError("No se pudo cargar el evento"))
    }, [idEvento])
    
    /*
        El setEvento(null) del efecto corre DESPUÉS del render, así que en el
        primer render de /eventos/crear el estado todavía tiene el evento
        anterior — y para entonces el formulario ya se montó con esos valores.
        Derivarlo acá lo resuelve: si la URL no apunta a un evento, no hay
        evento, sin depender de cuándo corra el efecto.
    */
    const eventoActual = idEvento ? evento : null;

    /*
        Las acciones salen del estado real del evento, y solo se muestran en
        modo "ver": mientras se edita, publicar o finalizar sería ambiguo
        (¿aplica sobre lo guardado o sobre lo que se está escribiendo?).
    */
    const acciones = eventoActual && modoPage === "ver" ? accionesPorEstado[eventoActual.estado] : [];

    const contenidoHeader = modoPage === "crear" ? (
        <h1 className="text-2xl font-bold">Crear Evento</h1>
    ) : (
        <div className="h-fit">
            <h1 className="text-2xl font-bold">Evento: {eventoActual?.nombre}</h1>
            <h2 className="text-sm font-medium text-gray-500">Estado: {eventoActual?.estado}</h2>
        </div>
    );

    // Mientras se trae el evento no tiene sentido pintar la pantalla vacía.
    if (error) {
        return (
            <main className="px-8">
                <p className="text-sm text-red-600">{error}</p>
            </main>
        );
    }
    if (idEvento && !eventoActual) {
        return (
            <main className="px-8">
                <p className="text-sm text-gray-500">Cargando evento…</p>
            </main>
        );
    }
    return (
        <main >
            <ContenedorDatos className="mb-4">
                <Header 
                titulo={
                    contenidoHeader
                }
                action={acciones.length > 0 && (
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
            
            <div className="flex justify-center gap-6">
                <ContenedorDatos className="max-w-[800px]">
                    {/*
                        No hace falta cambiar el modo a mano: al navegar, la URL
                        pasa a tener el id y modoPage se recalcula solo.
                    */}
                    {/*
                        La key hace que React monte un formulario nuevo cada vez
                        que cambia el evento (o al volver a "crear"), en vez de
                        reutilizar la instancia con los valores viejos adentro.
                    */}
                    <EventoForm
                        key={idEvento ?? "nuevo"}
                        modo={modoPage}
                        evento={eventoActual ?? undefined}
                        onCreated={(evento) => navigate(RUTAS.eventos.detalle(evento.id))}
                        onUpdated={(eventoActualizado) => {
                            // El PUT devuelve el evento ya actualizado, así que
                            // alcanza con guardarlo: no hace falta volver a pedirlo.
                            setEvento(eventoActualizado);
                            setEditando(false);
                        }}
                        onCancel={() => setEditando(false)}
                    />
                </ContenedorDatos>
                {modoPage != "crear" &&
                <ContenedorDatos >
                    <ListaEntradas />  
                    <div>
                    <Link to={RUTAS.eventos.ventas(2)} className="mt-4 min-w-[150px]">Ver Ventas</Link>
                </div>          
                </ContenedorDatos>}
                  
            </div>   
        </main>
    );
}
export default EventoPage;