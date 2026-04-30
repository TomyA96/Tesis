import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import FiltroEventos from "../componentes/FiltroEventos";
import { useState } from "react";
import type { EventoEstado } from "../componentes/FiltroEventos";
import { MESES, estados } from "../../../constantes/MesesAños";
import { useNavigate } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import { CalendarDays } from "lucide-react";

// ── TIPOS ─────────────────────────────────────────────────────────────────────
// Los tipos se definen acá si son exclusivos de esta feature.
// Si Evento se usa en otras features, moverlo a un archivo compartido:
// src/app/features/eventos/types/evento.ts
export type Evento = {
    id: number;
    nombre: string;
    fecha: string;
    estado: EventoEstado;
    lugar: string;
    capacidad: number;
    entradasVendidas: number;
};

// ── DATA MOCK ─────────────────────────────────────────────────────────────────
// Fuera del componente — es estática.
// Cuando conectes el backend, reemplazás esto por un hook: useEventos(año)
export const eventosMock: Evento[] = [
    { id: 1, nombre: "Expo Tecnología 2026",   fecha: "2026-03-15", estado: "activo",     capacidad: 1200, entradasVendidas: 850,  lugar: "Centro de Convenciones" },
    { id: 2, nombre: "Feria Gamer",             fecha: "2026-06-20", estado: "activo",   capacidad: 800,  entradasVendidas: 0,    lugar: "Complejo Arena"         },
    { id: 3, nombre: "Festival Rock",           fecha: "2025-11-10", estado: "finalizado", capacidad: 5000, entradasVendidas: 4800, lugar: "Parque Central"         },
    { id: 4, nombre: "Congreso de Marketing",   fecha: "2024-09-05", estado: "cancelado",  capacidad: 600,  entradasVendidas: 120,  lugar: "Hotel Plaza"            },
    { id: 5, nombre: "Encuentro Startups",      fecha: "2026-08-02", estado: "activo",     capacidad: 300,  entradasVendidas: 210,  lugar: "Hub de Innovación"      },
];

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
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<EventoEstado | "">("");
    const navigate = useNavigate();
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

                    {eventosMock.length > 0 ? (
                        <>
                            <div className="px-6 pt-4">
                                <FiltroEventos
                                    meses={MESES}
                                    estados={estados}
                                    mes={mesSeleccionado}
                                    estado={estadoSeleccionado}
                                    onEstadoChange={setEstadoSeleccionado}
                                    onMesesChange={setMesSeleccionado}
                                />
                            </div>

                            <GenericTable<Evento>
                                columns={["nombre", "fecha", "estado", "lugar", "entradasVendidas"]}
                                data={eventosMock}
                                actions={(_row) => (
                                    <Btn variant="outline" size="sm">
                                        Ver Detalles
                                    </Btn>
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

        </main>
    );
};

export default InicioEventos;
