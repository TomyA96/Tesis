import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import { CalendarDays } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import FiltroVentas from "../componentes/FiltroVentas";
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

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────────
const VentasPage = () => {
    const { idEvento } = useParams<{ idEvento: string }>();
    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                volver={{ to: RUTAS.eventos.detalle(idEvento ?? ""), label: "Volver al evento" }}
                icono={<CalendarDays />}
                seccion="Eventos"
                titulo="Ventas del evento"
            />
            <ContenedorDatos>

                {/* Filtros con padding lateral para alinearse con la tabla */}
                <div className="px-6 mt-4">
                    <FiltroVentas />
                </div>

                <GenericTable<EntradaVenta>
                    columns={[]}
                    data={[]}
                    
                    actions={(_row) => (
                        <div className="flex items-center gap-3 justify-end">
                            
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