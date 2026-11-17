import Header from "../../../ui/componentes/Header";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import Btn from "../../../ui/componentes/Btn";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import FiltroEventos, { aplicarFiltrosEventos, filtrosEventosVacios, type FiltrosEventos } from "../componentes/FiltroEventos";
import { useEffect, useMemo, useState } from "react";
import { getEventos, getPendientesDeCierre, type Evento, type EventoPendienteDeCierre } from "../../../services/eventosService"
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { RUTAS } from "../../../constantes/Rutas";
import { CalendarDays } from "lucide-react";
import PanelPendientesCierre from "../componentes/PanelPendientesCierre";
import { columnasEventos } from "../eventos.columns";
import { deleteEvento } from "../../../services/eventosService";
import { cn } from "../../../../lib/cn";
import {cargarAñosEventos} from "../../../utils/cargarAñosEventos";
import { resumirJornadas } from "../utils/resumenJornadas";
import DropdownAnio from "../../../ui/componentes/DropdownAnio";

// ── TIPOS ─────────────────────────────────────────────────────────────────────
// Los tipos se definen acá si son exclusivos de esta feature.
// Si Evento se usa en otras features, moverlo a un archivo compartido:
// src/app/features/eventos/types/evento.ts

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const EventosHomePage = () => {
    // camelCase para variables — las mayúsculas se reservan para componentes y tipos
    const añoActual = new Date().getFullYear();
    const [añoSeleccionado, setAñoSeleccionado] = useState<number>(añoActual);
    const [filtros, setFiltros] = useState<FiltrosEventos>(filtrosEventosVacios);
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
    const [eventos, setEventos] = useState<Evento[]>([])
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const [error, setError] = useState("")
    const [pendientesCierre, setPendientesCierre] = useState<EventoPendienteDeCierre[]>([]);

    const eventosPorAño = useMemo(
        () => eventos.filter(
            evento =>  new Date(evento.fechaHoraInicio).getFullYear() === añoSeleccionado), 

            [eventos, añoSeleccionado]);

    const eventosFiltrados = useMemo(
        () => aplicarFiltrosEventos(eventosPorAño, filtros),
        [eventosPorAño, filtros]
    );

    // Los cards cuentan las jornadas de los eventos del año elegido
    const resumen = useMemo(
        () => resumirJornadas(eventosPorAño, new Date()),
        [eventosPorAño]
    );

    useEffect(() => {
        getEventos()
            .then((response) => {
                setEventos(response)
            })
            .catch(() => setError("No se pudieron cargar los eventos"));
        // No depende del año: un evento viejo sin cerrar tiene que seguir apareciendo
        getPendientesDeCierre()
            .then(setPendientesCierre)
            .catch(() => setError("No se pudieron cargar los eventos por finalizar"));
    }, [])

  

   


    return (
        <main className="flex flex-col gap-6 px-6 pb-8">

            {/* ── HEADER ────────────────────────────────────────────────────── */}
            {/*
                El dropdown de año va en el header porque filtra toda la página,
                no solo la tabla. Es un filtro global de la vista.
            */}
            <EncabezadoPagina
                icono={<CalendarDays />}
                seccion="Eventos"
                titulo="Eventos del año"
                acciones={
                    <>
                        <DropdownAnio
                            años={cargarAñosEventos(eventos, añoActual)}
                            value={añoSeleccionado}
                            onChange={setAñoSeleccionado}
                        />
                        <LinkBtn to={RUTAS.eventos.crear}>
                            + Nuevo Evento
                        </LinkBtn>
                    </>
                }
            />
            

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            {/* ── CARDS DE MÉTRICAS ─────────────────────────────────────────── */}
            <section aria-label="Resumen de eventos">
                {/* Las 6 de jornadas (del año elegido) a la izquierda y el panel de eventos por finalizar al lado, ocupando las dos filas */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card title="Jornadas próximas"      icono={<CalendarDays />} colorIcono="green"  content={resumen.proximas} />
                        <Card title="Jornadas sin finalizar" icono={<CalendarDays />} colorIcono="orange" content={resumen.sinFinalizar} />
                        <Card title="Jornadas en borrador"   icono={<CalendarDays />} colorIcono="indigo" content={resumen.borrador} />
                        <Card title="Jornadas finalizadas"   icono={<CalendarDays />}                     content={resumen.finalizadas} />
                        <Card title="Jornadas suspendidas"   icono={<CalendarDays />} colorIcono="yellow" content={resumen.suspendidas} />
                        <Card title="Jornadas canceladas"    icono={<CalendarDays />} colorIcono="red"    content={resumen.canceladas} />
                    </div>
                    <PanelPendientesCierre eventos={pendientesCierre} />
                </div>
            </section>

            {/* ── TABLA DE EVENTOS ──────────────────────────────────────────── */}
            <section aria-label="Listado de eventos">
                <ContenedorDatos>
                    <Header titulo={`Lista de Eventos Año: ${añoSeleccionado}`} />
                    <div className="px-6 pt-4">
                        <FiltroEventos
                            filtros={filtros}
                            onChange={(filtros) => {
                                setFiltros(filtros)
                            }}
                        />
                    </div>

                    { eventosFiltrados.length > 0 ? (
                            <GenericTable<Evento>
                                columns={columnasEventos}
                                data={eventosFiltrados}
                                actions={(row) => (
                                    <div className={cn("grid gap-2", row.estado === "Borrador" ? "grid-cols-2" : "grid-cols-1")}>
                                        <LinkBtn
                                            variant="outline"
                                            size="sm"
                                            to={RUTAS.eventos.detalle(row.id)}
                                        >
                                            Ver Detalles
                                        </LinkBtn>
                                        {row.estado === "Borrador" && (
                                            <Btn variant="danger" size="sm" onClick={() => {
                                                setEventoSeleccionado(row);
                                                setConfirmandoEliminar(true);
                                            }}>
                                                Eliminar
                                            </Btn>
                                        )}
                                    </div>
                                    
                                )}
                            />
                    ) : (
                        // Estado vacío — mismo patrón que GenericTable usa internamente
                        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                            No hay eventos registrados para el año {añoSeleccionado}.
                        </div>
                    )}
                </ContenedorDatos>
            </section>

            <ConfirmarAccion
                isOpen={confirmandoEliminar}
                title="Eliminar evento"
                mensaje="Desea confirmar la eliminación del evento"
                entidad={eventoSeleccionado?.nombre || ""}
                onConfirmar={async () => {
                    if (!eventoSeleccionado) return;
                    await deleteEvento(eventoSeleccionado.id);
                    getEventos().then(setEventos);
                    setConfirmandoEliminar(false);
                }}
                onCancelar={() => setConfirmandoEliminar(false)}
            />

        </main>
    );
};

export default EventosHomePage;
