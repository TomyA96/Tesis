import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Header from "../../../ui/componentes/Header";
import FiltroVentas from "../componentes/FiltroVentas";
import {useState} from "react";
import {useParams} from "react-router-dom";

// ── TIPOS ──────────────────────────────────────────────────────────────────────
type EstadoEntrada = "valida" | "usada" | "anulada";
type CanalVenta    = "online" | "fisica";

type EntradaVenta = {
    id:            string;
    codigoEntrada: string;
    estado:        EstadoEntrada;
    canalVenta:    CanalVenta;
    fechaVenta:    string;
    comprador:     string;
    compraId:      string;
};


const BadgeEstado = ({ estado }: { estado: EstadoEntrada }) => {
    const estilos: Record<EstadoEntrada, string> = {
        valida:  "bg-emerald-100 text-emerald-700",
        usada:   "bg-gray-100    text-gray-600",
        anulada: "bg-red-100     text-red-600",
    };

    const etiquetas: Record<EstadoEntrada, string> = {
        valida:  "Válida",
        usada:   "Usada",
        anulada: "Anulada",
    };

    return (
        // inline-flex + rounded-full = forma de pastilla (pill)
        // px-2.5 py-0.5 = padding compacto
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[estado]}`}>
            {etiquetas[estado]}
        </span>
    );
};

// ── BADGE DE CANAL ─────────────────────────────────────────────────────────────
// Mismo patrón que BadgeEstado pero para el canal de venta
const BadgeCanal = ({ canal }: { canal: CanalVenta }) => {
    const estilos: Record<CanalVenta, string> = {
        online:  "bg-blue-100  text-blue-700",
        fisica:  "bg-amber-100 text-amber-700",
    };

    const etiquetas: Record<CanalVenta, string> = {
        online:  "Online",
        fisica:  "Física",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[canal]}`}>
            {etiquetas[canal]}
        </span>
    );
};

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────────
const VentasPage = () => {
    const { idEvento } = useParams<{ idEvento: string }>();
    return (
        <main className="flex flex-col gap-6 px-6">
            <ContenedorDatos>
                <Header titulo="Lista de ventas del evento" />

                {/* Filtros con padding lateral para alinearse con la tabla */}
                <div className="px-6 mt-4">
                    <FiltroVentas />
                </div>

                <GenericTable<EntradaVenta>
                    columns={[]}
                    data={[]}
                    
                    actions={(_row) => (
                        <div className="flex items-center gap-3 justify-end">
                            {/* Badges inline en la columna de acciones */}
                            
                            <Btn variant="outline" size="sm">
                                Visualizar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>
        </main>
    );
};

export default VentasPage;