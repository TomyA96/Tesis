import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import FiltroEventos, { aplicarFiltrosEventos, filtrosEventosVacios, type FiltrosEventos } from "../componentes/FiltroEventos";
import { useEffect, useMemo, useState } from "react";
import { getEventos, type Evento } from "../../../services/eventosService"
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { RUTAS } from "../../../constantes/Rutas";
import { CalendarDays } from "lucide-react";
import { columnasEventos } from "../eventos.columns";
import { deleteEvento } from "../../../services/eventosService";
import { cn } from "../../../../lib/cn";
import {cargarAñosEventos} from "../utils/cargarAñosEventos";
import {contarEventosPorEstado} from "../utils/contarEventosPorEstado";

// ── TIPOS ─────────────────────────────────────────────────────────────────────
// Los tipos se definen acá si son exclusivos de esta feature.
// Si Evento se usa en otras features, moverlo a un archivo compartido:
// src/app/features/eventos/types/evento.ts

// ── DROPDOWN DE AÑO ───────────────────────────────────────────────────────────
// Componente separado — responsabilidad única: mostrar un selector de año.
// Está acá porque por ahora solo se usa en esta página.
// Si lo necesitás en otro lado, moverlo a ui/componentes/DropdownAnio.tsx
type DropdownAnioProps = {
    años: number[];
    value: number;
    onChange: (anio: number) => void;
};

const DropdownAnio = ({  años, value, onChange }: DropdownAnioProps) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
                Año:
            </span>
            <select
                id="selector-anio"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            >
                {años.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                ))}
            </select>
        </div>
    );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const InicioEventos = () => {
    // camelCase para variables — las mayúsculas se reservan para componentes y tipos
    const añoActual = new Date().getFullYear();
    const [añoSeleccionado, setAñoSeleccionado] = useState<number>(añoActual);
    const [filtros, setFiltros] = useState<FiltrosEventos>(filtrosEventosVacios);
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
    const [eventos, setEventos] = useState<Evento[]>([])
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const [error, setError] = useState("")

    const eventosPorAño = useMemo(
        () => eventos.filter(
            evento =>  new Date(evento.fechaHoraInicio).getFullYear() === añoSeleccionado), 

            [eventos, añoSeleccionado]);

    const eventosFiltrados = useMemo(
        () => aplicarFiltrosEventos(eventosPorAño, filtros),
        [eventosPorAño, filtros]
    );

    const conteoPorEstado = useMemo(
        () => contarEventosPorEstado(eventosPorAño),
        [eventosPorAño]
    );

    useEffect(() => {
        getEventos()
            .then((response) => {
                setEventos(response)
            })
            .catch(() => setError("No se pudieron cargar los permisos"));
    }, [])

  

   


    return (
        <main className="flex flex-col gap-6 px-8">

            {/* ── HEADER ────────────────────────────────────────────────────── */}
            {/* 
                El dropdown de año va en el header porque filtra toda la página,
                no solo la tabla. Es un filtro global de la vista.
            */}
            <ContenedorDatos>
                <Header
                titulo="Eventos"
                action={
                    <div className="flex items-center gap-4">
                        <DropdownAnio
                            años={cargarAñosEventos(eventos, añoActual)}
                            value={añoSeleccionado}
                            onChange={setAñoSeleccionado}
                        />
                        <LinkBtn to={RUTAS.eventos.crear}>
                            + Nuevo Evento
                        </LinkBtn>
                    </div>
                }
            />
            </ContenedorDatos>
            

            {/* ── CARDS DE MÉTRICAS ─────────────────────────────────────────── */}
            <section aria-label="Resumen de eventos">
                <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-5 gap-4">
                    <Card title="Eventos Activos"    icono={<CalendarDays/>} colorIcono="green"  content={conteoPorEstado["Activo"]} />
                    <Card title="Eventos Borradores"  icono={<CalendarDays/>} colorIcono="gray"  content={conteoPorEstado["Borrador"]} />
                    <Card title="Eventos Finalizados" icono={<CalendarDays/>} content={conteoPorEstado["Finalizado"]} />
                    <Card title="Eventos Suspendidos"  icono={<CalendarDays/>} colorIcono="yellow"  content={conteoPorEstado["Suspendido"]} />
                    <Card title="Eventos Cancelados"  icono={<CalendarDays/>} colorIcono="red"  content={conteoPorEstado["Cancelado"]} />
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

export default InicioEventos;
