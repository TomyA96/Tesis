// ═══════════════════════════════════════════════════════════════════════════════
// CardEvent.tsx
// ═══════════════════════════════════════════════════════════════════════════════
import Btn from "../../../ui/componentes/Btn";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import GastoModal from "../modales/GastoModal";
import IngresoModal from "../modales/IngresoModal";import { useState } from "react";

 type ModalRegistar =
    | "nuevoGasto"
    | "nuevoIngreso"
    | "modificarLista"
    | null;

type Estado = "activo" | "suspendido";
 
type EventProps = {
    nombre: string;
    fecha: string;
    estado: Estado;
};
 
// ── BADGE DE ESTADO ────────────────────────────────────────────────────────────
// Mismo patrón que BadgeEstado en Ventas — cada estado tiene su color semántico
const BadgeEstadoEvento = ({ estado }: { estado: Estado }) => {
    const estilos: Record<Estado, string> = {
        activo:     "bg-emerald-100 text-emerald-700",
        suspendido: "bg-amber-100   text-amber-700",
    };
 
    const etiquetas: Record<Estado, string> = {
        activo:     "Activo",
        suspendido: "Suspendido",
    };
 
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[estado]}`}>
            {etiquetas[estado]}
        </span>
    );
};
 
const CardEvent = ({ nombre, fecha, estado }: EventProps) => {
    const navigate = useNavigate();
    const [modalActivo, setModalActivo] = useState<ModalRegistar>(null);
 
    return (
        /*
            flex flex-col: apila el contenido verticalmente
            h-full: todas las cards tienen la misma altura dentro del grid
            group: permite que los hijos usen group-hover para reaccionar
                   al hover de la card completa
        */
       
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
            <GastoModal
                isOpen={modalActivo === "nuevoGasto"}
                closeModal={() => setModalActivo(null)}
                modo="crear"
            />
            <IngresoModal
                isOpen={modalActivo === "nuevoIngreso"}
                closeModal={() => setModalActivo(null)}
                modo="crear"
            />
            {/* ── FRANJA SUPERIOR DE COLOR ──────────────────────────────────────
                Comunica visualmente el estado sin necesidad de leer el badge.
                activo     → franja verde
                suspendido → franja amarilla
            */}
            <div className={`h-1.5 w-full ${estado === "activo" ? "bg-emerald-500" : "bg-amber-400"}`} />
 
            {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────── */}
            <div className="flex flex-col flex-1 p-5 gap-3">
 
                {/* Nombre + Badge en la misma fila */}
                <div className="flex items-start justify-between gap-2">
                    {/*
                        h3 en lugar de h1 — es un subtítulo dentro de una card,
                        no el título principal de la página
                        line-clamp-2: si el nombre es muy largo, corta en 2 líneas
                    */}
                    <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                        {nombre}
                    </h3>
                    <BadgeEstadoEvento estado={estado} />
                </div>
 
                {/* Fecha con ícono */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{fecha}</span>
                </div>
 
                {/* ── ACCIONES ──────────────────────────────────────────────────
                    mt-auto empuja los botones al fondo de la card,
                    sin importar cuánto contenido haya arriba.
                    Así todas las cards tienen los botones alineados al mismo nivel.
                */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Btn variant="outline" size="sm" className="flex-1" onClick={() => setModalActivo("nuevoGasto")}>
                            Registrar Gasto
                        </Btn>
                        <Btn variant="outline" size="sm" className="flex-1" onClick={() => setModalActivo("nuevoIngreso")}>
                            Registrar Ingreso
                        </Btn>
                    </div>
                    <Btn variant="primary" size="sm" className="w-full" onClick={() => navigate(RUTAS.administracion.administrarEvento(2))}>
                        Administrar Evento
                    </Btn>
                </div>
 
            </div>
        </div>
    );
};
 
export default CardEvent;