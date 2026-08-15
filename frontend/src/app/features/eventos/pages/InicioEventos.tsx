import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import FiltroEventos from "../componentes/FiltroEventos";
import { useEffect, useState } from "react";
import { getEventos, opcionesEstadoEvento, type EstadoEvento, type Evento } from "../../../services/eventosService"
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { useNavigate } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import { CalendarDays } from "lucide-react";
import { columnasEventos } from "../eventos.columns";
import { deleteEvento } from "../../../services/eventosService";

// ── TIPOS ─────────────────────────────────────────────────────────────────────
// Los tipos se definen acá si son exclusivos de esta feature.
// Si Evento se usa en otras features, moverlo a un archivo compartido:
// src/app/features/eventos/types/evento.ts

// ── DROPDOWN DE AÑO ───────────────────────────────────────────────────────────
// Componente separado — responsabilidad única: mostrar un selector de año.
// Está acá porque por ahora solo se usa en esta página.
// Si lo necesitás en otro lado, moverlo a ui/componentes/DropdownAnio.tsx
type DropdownAnioProps = {
    desde: number;
    hasta: number;
    value: number;
    onChange: (anio: number) => void;
};

const DropdownAnio = ({ desde, hasta, value, onChange }: DropdownAnioProps) => {
    // Genera el array de años de mayor a menor
    // Ejemplo: hasta=2026, desde=2008 → [2026, 2025, ..., 2008]
    const opciones: number[] = [];
    
    for (let i = hasta; i >= desde; i--) {
        opciones.push(i);
    }

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
                {opciones.map((opcion) => (
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
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(0);
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoEvento | "">("");
    const [eventos, setEventos] = useState<Evento[]>([])
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const [error, setError] = useState("")

    const navigate = useNavigate();

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
                            desde={2008}
                            hasta={añoActual}
                            value={añoSeleccionado}
                            onChange={setAñoSeleccionado}
                        />
                        <Btn onClick={() => navigate(RUTAS.eventos.crear)}>
                            + Nuevo Evento
                        </Btn>
                    </div>
                }
            />
            </ContenedorDatos>
            

            {/* ── CARDS DE MÉTRICAS ─────────────────────────────────────────── */}
            <section aria-label="Resumen de eventos">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title="Eventos Activos"    icono={<CalendarDays/>} colorIcono="green"  content={3} />
                    <Card title="Eventos Finalizados" icono={<CalendarDays/>} content={5} />
                    <Card title="Eventos Pendientes"  icono={<CalendarDays/>} colorIcono="yellow"  content={2} />
                    <Card title="Eventos Cancelados"  icono={<CalendarDays/>} colorIcono="red"  content={1} />
                </div>
            </section>

            {/* ── TABLA DE EVENTOS ──────────────────────────────────────────── */}
            <section aria-label="Listado de eventos">
                <ContenedorDatos>
                    <Header titulo={`Resumen de Eventos — ${añoSeleccionado}`} />

                    { eventos.length > 0 ? (
                        <>
                            {/*<div className="px-6 pt-4">
                                <FiltroEventos
                                    meses={MESES}
                                    estados={opcionesEstadoEvento}
                                    mes={mesSeleccionado}
                                    estado={("")}
                                    
                                    onMesesChange={setMesSeleccionado}
                                />
                            </div>*/}

                            <GenericTable<Evento>
                                columns={columnasEventos}
                                data={eventos}
                                actions={(row) => (
                                    <div>
                                        <Btn variant="outline" size="sm">
                                            Ver Detalles
                                        </Btn>
                                        <Btn variant="danger" size="sm" onClick={() => {
                                            setEventoSeleccionado(row);
                                            setConfirmandoEliminar(true);
                                        }}>
                                            Eliminar
                                        </Btn>
                                    </div>
                                    
                                )}
                            />
                        </>
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
                mensaje="¿Desea confirmar la eliminación del evento?"
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
