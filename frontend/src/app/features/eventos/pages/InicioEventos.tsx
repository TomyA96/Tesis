import Header from "../../../ui/componentes/Header";
import Btn from "../../../ui/componentes/Btn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTabla";

import FiltroEventos from "../componentes/FiltroEventos";
import { useState } from "react";
import type { EventoEstado } from "../componentes/FiltroEventos";
import { meses, estados } from "../../../constantes/MesesAños";

type DropdownProps = {
    desde: number;
    hasta: number;
    value: number;
    onChange: (year: number) => void;
}


export type Evento = {
    id: number;
    nombre: string;
    fecha: string;
    estado: EventoEstado;
    lugar: string;
    entradasVendidas: number;
}

export const eventosMock = [
  {
    id: 1,
    nombre: "Expo Tecnología 2026",
    fecha: "2026-03-15",
    estado: "activo",
    capacidad: 1200,
    entradasVendidas: 850,
    lugar: "Centro de Convenciones",
  },
  {
    id: 2,
    nombre: "Feria Gamer",
    fecha: "2026-06-20",
    estado: "borrador",
    capacidad: 800,
    entradasVendidas: 0,
    lugar: "Complejo Arena",
  },
  {
    id: 3,
    nombre: "Festival Rock",
    fecha: "2025-11-10",
    estado: "finalizado",
    capacidad: 5000,
    entradasVendidas: 4800,
    lugar: "Parque Central",
  },
  {
    id: 4,
    nombre: "Congreso de Marketing",
    fecha: "2024-09-05",
    estado: "cancelado",
    capacidad: 600,
    entradasVendidas: 120,
    lugar: "Hotel Plaza",
  },
  {
    id: 5,
    nombre: "Encuentro Startups",
    fecha: "2026-08-02",
    estado: "activo",
    capacidad: 300,
    entradasVendidas: 210,
    lugar: "Hub de Innovación",
  },
];

function CargarDropdown({desde, hasta, value, onChange}: DropdownProps) {
    const opciones: number[] = [];
    for (let i= hasta; i>= desde; i--) {
        opciones.push(i);
    }
    
    
    return (
        <div className="flex items-center gap-2">
            <label className="font-semibold" htmlFor="">Año:</label>
            <select className="border border-gray-300 rounded-md p-2 "
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            >
                {opciones.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                ))}
            </select>
            
        </div>
        
    );
}

export default function InicioEventos () {
    const AñoActual = new Date().getFullYear();
    const [añoSeleccionado, setAñoSeleccionado] = useState<number>(AñoActual);
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(0);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<EventoEstado | "">("");
    console.log("Estado Seleccionado:", estadoSeleccionado, "mesSeleccionado:", mesSeleccionado);
    return(
        <main>
            <Header encabezado="Eventos" action={
                <div className="flex items-center gap-4">
                    <CargarDropdown
                    desde={2008}
                    hasta={AñoActual}
                    value={añoSeleccionado}
                    onChange={setAñoSeleccionado}
                    />
                    <Btn>
                        + Nuevo Evento
                    </Btn>
                </div>
            }/>

            <section className="flex justify-center p-4 w-full ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-15   h-fit ">
                    <Card title="Eventos Activos" content={3}/>
                    <Card title="Eventos Finalizados" content={5}/>
                    <Card title="Eventos Pendientes" content={2}/>
                    <Card title="Eventos Cancelados" content={1}/>
                </div>
            </section>
            <section>
                <div className="w-full px-6  bg-white p-8 rounded-xl shadow-md h-fit mt-4 ">
                    <h1 className="font-bold text-2xl mb-4">    
                            Resumen de Eventos del Año {añoSeleccionado}
                        </h1>
                    {eventosMock.length > 0 ? (<div className="w-full">
                        
                        <FiltroEventos meses={meses} estados={estados} mes={mesSeleccionado} estado={estadoSeleccionado} 
                        onEstadoChange={setEstadoSeleccionado} onMesesChange={setMesSeleccionado} />
                        <GenericTable
                        columns={["nombre", "fecha", "estado", "lugar", "entradasVendidas"]}
                        data={eventosMock}
                        actions={(_row) => (
                            <Btn variant="primary" size="sm">
                            Ver Detalles
                            </Btn>
                        )}
                        />
                    </div>) :
                    (<p className="text-gray-600">
                        No hay eventos registrados para el año {añoSeleccionado}.
                    </p>)}
                </div>
            </section>
        </main>
    );
}