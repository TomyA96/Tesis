import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventoForm from "../forms/EventoForm";
import CrearEventoForm from "../forms/CrearEventoForm";
import ImagenEventoCard from "../componentes/ImagenEventoCard";
import { RUTAS } from "../../../constantes/Rutas";
import { getEvento } from "../../../services/eventosService";
import type { Evento, EstadoEvento } from "../../../services/eventosService";

import Etiqueta from "../../../ui/componentes/Etiqueta";
import { cn } from "../../../../lib/cn";
import { coloresEstadoEvento } from "../eventos.columns";

export type ModoEventoPage = "crear" | "ver" | "editar";

const EventoPage = () => {
    const { idEvento } = useParams();
    const navigate = useNavigate();
    /*
        El único estado real es "¿el usuario tocó Editar?". Si estamos creando
        o viendo se deriva de la URL en cada render, así no puede quedar
        desincronizado al navegar entre /eventos/crear y /eventos/:id.
    */
    const [editando, setEditando] = useState(false);
    const modoPage: ModoEventoPage = !idEvento ? "crear" : editando ? "editar" : "ver";
    const [evento, setEvento] = useState<Evento | null>(null);
    const [error, setError] = useState("");

    /*
        TODO (jornadas): el estado de la pantalla que falta
        - idJornadaSeleccionada (o leerla de la URL con ?jornada=ID)
        - entradas de la jornada elegida
        - confirmandoCancelar / confirmandoFinalizar / confirmandoSuspender,
          ahora por jornada, y las acciones (publicar, suspender, cancelar,
          finalizar, reprogramar) de jornadasService
    */

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
            .then((eventoBuscado) => setEvento(eventoBuscado))
            .catch(() => setError("No se pudo cargar el evento"));
    }, [idEvento]);

    /*
        El setEvento(null) del efecto corre DESPUÉS del render, así que en el
        primer render de /eventos/crear el estado todavía tiene el evento
        anterior. Derivarlo acá lo resuelve: si la URL no apunta a un evento,
        no hay evento, sin depender de cuándo corra el efecto.
    */
    const eventoActual = idEvento ? evento : null;

    const contenidoHeader = (
        <div className="h-fit">
            <h1 className="text-2xl font-bold">{eventoActual?.nombre}</h1>
            <h2 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                Estado:{" "}
                <Etiqueta color={coloresEstadoEvento[eventoActual?.estado as EstadoEvento] || "gris"}>
                    {eventoActual?.estado}
                </Etiqueta>
            </h2>
        </div>
    );

    if (error) {
        return (
            <main className="px-8">
                <p className="text-sm text-red-600">{error}</p>
            </main>
        );
    }
    // Mientras se trae el evento no tiene sentido pintar la pantalla vacía
    if (idEvento && !eventoActual) {
        return (
            <main className="px-8">
                <p className="text-sm text-gray-500">Cargando evento…</p>
            </main>
        );
    }

    return (
        <main>
            {/* Al crear no hay header: el formulario ya lleva su título y se aprovecha todo el espacio */}
            {modoPage !== "crear" && (
                <ContenedorDatos className="mb-4">
                    <Header
                        titulo={contenidoHeader}
                        // TODO (jornadas): las acciones por estado pasan a ser por jornada. Por ahora solo Editar.
                        action={
                            modoPage === "ver" && (
                                <Btn variant="secondary" className="min-w-[110px]" onClick={() => setEditando(true)}>
                                    Editar
                                </Btn>
                            )
                        }
                    />
                </ContenedorDatos>
            )}

            {modoPage === "crear" && (
                <ContenedorDatos className="p-6">
                    <CrearEventoForm onCreated={(nuevo) => navigate(RUTAS.eventos.detalle(nuevo.id))} />
                </ContenedorDatos>
            )}

            {eventoActual && (
                <div className="flex justify-center gap-6">
                    <ContenedorDatos className={cn("max-w-[800px] gap-6 p-6", modoPage === "editar" && "relative z-50")}>
                        <EventoForm
                            key={eventoActual.id}
                            modo={modoPage === "editar" ? "editar" : "ver"}
                            evento={eventoActual}
                            onUpdated={(actualizado) => {
                                // El PUT devuelve solo los datos del evento (sin jornadas ni estado): se mezclan con lo que ya hay
                                setEvento((prev) => (prev ? { ...prev, ...actualizado } : prev));
                                setEditando(false);
                            }}
                            onCancel={() => setEditando(false)}
                        />
                        <ImagenEventoCard idEvento={eventoActual.id} estado={eventoActual.estado} />
                    </ContenedorDatos>

                    <ContenedorDatos>
                        {/*
                            TODO (jornadas), de arriba hacia abajo:
                            1. SelectorJornadas con eventoActual.jornadas
                            2. JornadaForm (key = id de la jornada elegida)
                            3. ListaEntradas de la jornada elegida (hoy recibe idEvento y capacidad)
                            4. agregar una jornada nueva (JornadaForm en modo "crear")
                        */}
                    </ContenedorDatos>
                </div>
            )}

            {modoPage === "editar" && <div className="fixed inset-0 z-40 bg-black/50" />}
        </main>
    );
};

export default EventoPage;
