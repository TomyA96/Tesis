import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { useEffect, useState } from "react";
import EventoForm from "../forms/EventoForm";
import ReprogramarModal from "../modales/ReprogramarModal";
import ListaEntradas from "../componentes/ListaEntradas";
import { useParams } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import { cancelarEvento, finalizarEvento, getEvento, publicarEvento, suspenderEvento } from "../../../services/eventosService";
import type { Evento, EstadoEvento } from "../../../services/eventosService";
import { useNavigate } from "react-router-dom";
import { getEntradas, type Entrada } from "../../../services/entradasService";

import Etiqueta, { type ColorEtiqueta } from "../../../ui/componentes/Etiqueta";
import { cn } from "../../../../lib/cn";


export type ModoEventoPage = "crear" | "ver" | "editar";


type BotonesEvento ={
    label: string;
    variant: "secondary" | "ghost" | "warning" | "success" | "danger";
    onClick?: () => void;
}

const coloresEstado: Record<EstadoEvento, ColorEtiqueta> = {
    Activo: "verde",
    Borrador: "indigo",
    Finalizado: "azul",
    Suspendido: "ambar",
    Cancelado: "rojo",
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
    const [entradas, setEntradas] = useState<Entrada[]>([])
    const [error, setError] = useState("")

    const [errorAccion, setErrorAccion] = useState("")
    // Controlan si el modal de "¿estás seguro?" está abierto — el botón del
    // header solo prende esto, la acción real se dispara en el onConfirmar.
    const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
    const [confirmandoFinalizar, setConfirmandoFinalizar] = useState(false);
    const [confirmandoSuspender, setConfirmandoSuspender] = useState(false);
    const [abrirReprogramar, setAbrirReprogramar] = useState(false);

    
    const ejecutarAccion = async (
        accionApi: () => Promise<Evento>,
        mensajeError: string,
         onExito?: () => void
    ) => {
        if (!idEvento) return;
        setErrorAccion("");
        try {
            const eventoActualizado = await accionApi();
            setEvento(eventoActualizado);
            onExito?.();
        } catch (err) {
            setErrorAccion(err instanceof Error ? err.message : mensajeError);
        }
    };

    const publicar = () => ejecutarAccion(() => publicarEvento(Number(idEvento)), "No se pudo publicar el evento", cargarEntradas);
    const suspender = () => ejecutarAccion(() => suspenderEvento(Number(idEvento)), "No se pudo suspender el evento");
    const cancelar = () => ejecutarAccion(() => cancelarEvento(Number(idEvento)), "No se pudo cancelar el evento", cargarEntradas);
    const finalizar = () => ejecutarAccion(() => finalizarEvento(Number(idEvento)), "No se pudo finalizar el evento", cargarEntradas);

    const accionesPorEstado: Record<EstadoEvento, BotonesEvento[]> = {
        Activo: [
            { label: "Editar", variant: "secondary", onClick: () => setEditando(true) },
            { label: "Finalizar", variant: "ghost", onClick: () => setConfirmandoFinalizar(true) },
            { label: "Suspender", variant: "warning", onClick: () => setConfirmandoSuspender(true) },
            { label: "Cancelar", variant: "danger", onClick: () => setConfirmandoCancelar(true) },
        ],
        Borrador: [
            { label: "Editar", variant: "secondary", onClick: () => setEditando(true) },
            { label: "Publicar", variant: "success", onClick: publicar },

        ],
        Suspendido:[
            { label: "Editar", variant: "secondary", onClick: () => setEditando(true) },
            {label: "Reprogramar", variant: "warning", onClick: () => setAbrirReprogramar(true)},
            { label: "Cancelar", variant: "danger", onClick: () => setConfirmandoCancelar(true) },
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

    const cargarEntradas = () => {
        if (!idEvento) return;
        getEntradas(Number(idEvento))
            .then((entradasEvento) => (setEntradas(entradasEvento)))
            .catch(() => setError("No se pudieron cargar las entradas"))
    };

    useEffect(() => {
        cargarEntradas();
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
    const acciones = eventoActual ? accionesPorEstado[eventoActual.estado] : [];

    const contenidoHeader = modoPage === "crear" ? (
        <h1 className="text-2xl font-bold">Crear Evento</h1>
    ) : (
        <div className="h-fit">
            <h1 className="text-2xl font-bold">{eventoActual?.nombre}</h1>
            <h2 className="flex gap-2 items-center text-sm font-medium text-gray-500 ">Estado: <Etiqueta color={coloresEstado[eventoActual?.estado as EstadoEvento] || "gris"} >{eventoActual?.estado}</Etiqueta></h2>
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
                                disabled={modoPage !== "ver"}
                                >{accion.label}
                            </Btn>   
                        ))}

                    </div>
                    )}/>
                {errorAccion && (
                    <p className="px-6 pb-4 text-sm text-red-600">{errorAccion}</p>
                )}
            </ContenedorDatos>
            
            <div className="flex justify-center gap-6">
                <ContenedorDatos className={cn("max-w-[800px]", modoPage === "editar" && "relative z-50")}>
                    {/*
                        La key incluye fechaHoraInicio además del id: así, no
                        solo remonta al cambiar de evento (o volver a "crear"),
                        sino también cada vez que la fecha cambia por afuera de
                        este formulario (por ejemplo, al reprogramar) — sin eso,
                        "datos" quedaría con la fecha vieja hasta que alguien
                        edite el evento a mano.
                    */}
                    <EventoForm
                        key={`${idEvento ?? "nuevo"}-${eventoActual?.fechaHoraInicio}`}
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
                {evento &&
                <ContenedorDatos >
                    <ListaEntradas 
                        entradas={entradas} 
                        idEvento={Number(idEvento)} 
                        estadoEvento={evento.estado} 
                        capacidad={evento.capacidad} 
                        onEntradaGuardada={cargarEntradas}
                    />  
                    <div>
                </div>          
                </ContenedorDatos>}
                  
            </div>

            {/*
                onConfirmar siempre cierra el modal, haya salido bien o mal la
                acción: si falló, ejecutarAccion ya guardó el motivo en
                errorAccion, que se muestra debajo del header una vez cerrado
                — mismo mecanismo que ya usan Publicar y Suspender sin modal.
            */}
            <ConfirmarAccion
                isOpen={confirmandoCancelar}
                title="Cancelar evento"
                mensaje="Esta acción no se puede deshacer, confirmás que querés cancelar el evento"
                entidad={eventoActual?.nombre}
                variante="danger"
                onConfirmar={async () => {
                    await cancelar();
                    setConfirmandoCancelar(false);
                }}
                onCancelar={() => setConfirmandoCancelar(false)}
            />
            <ConfirmarAccion
                isOpen={confirmandoFinalizar}
                title="Finalizar evento"
                mensaje="Esta acción no se puede deshacer, confirmás que querés finalizar el evento"
                entidad={eventoActual?.nombre}
                onConfirmar={async () => {
                    await finalizar();
                    setConfirmandoFinalizar(false);
                }}
                onCancelar={() => setConfirmandoFinalizar(false)}
            />
            <ConfirmarAccion
                isOpen={confirmandoSuspender}
                title="Suspender evento"
                mensaje="El evento va a dejar de estar disponible hasta que lo reprogrames o lo canceles, confirmás que querés suspender el evento"
                entidad={eventoActual?.nombre}
                onConfirmar={async () => {
                    await suspender();
                    setConfirmandoSuspender(false);
                }}
                onCancelar={() => setConfirmandoSuspender(false)}
            />
            {/*
                Este modal, a diferencia de los ConfirmarAccion, tiene un
                formulario con datos reales adentro — por eso solo se renderiza
                cuando eventoActual existe (necesita la fecha actual para
                precargar los campos), y su propio submit maneja la llamada a
                la API y el error localmente, sin pasar por errorAccion.
            */}
            {eventoActual && (
                <ReprogramarModal
                    isOpen={abrirReprogramar}
                    evento={eventoActual}
                    closeModal={() => setAbrirReprogramar(false)}
                    onReprogramado={(eventoActualizado) => {
                        setEvento(eventoActualizado);
                        setAbrirReprogramar(false);
                    }}
                />
            )}
            {modoPage === "editar" && (
                <div className="fixed inset-0 z-40 bg-black/50" />
            )}
        </main>
    );
}
export default EventoPage;