import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTabla";
import Header from "../../../ui/componentes/Header";
import FiltroVentas from "../componentes/FiltroVentas";

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

// ── DATA MOCK ──────────────────────────────────────────────────────────────────
// Fuera del componente — cuando conectes el backend, reemplazás esto por un hook
export const ventasMock: EntradaVenta[] = [
    { id: "1", codigoEntrada: "EVT-9F3A2", estado: "valida",  canalVenta: "online",  fechaVenta: "2026-03-10 18:32", comprador: "Juan Pérez",       compraId: "CMP-1001" },
    { id: "2", codigoEntrada: "EVT-9F3A3", estado: "valida",  canalVenta: "online",  fechaVenta: "2026-03-10 18:32", comprador: "Juan Pérez",       compraId: "CMP-1001" },
    { id: "3", codigoEntrada: "EVT-9F3A4", estado: "usada",   canalVenta: "fisica",  fechaVenta: "2026-03-11 21:10", comprador: "María González",   compraId: "CMP-1002" },
    { id: "4", codigoEntrada: "EVT-7B2C9", estado: "valida",  canalVenta: "online",  fechaVenta: "2026-03-12 09:45", comprador: "Lucas Fernández",  compraId: "CMP-1003" },
    { id: "5", codigoEntrada: "EVT-7B2D0", estado: "anulada", canalVenta: "online",  fechaVenta: "2026-03-12 09:45", comprador: "Lucas Fernández",  compraId: "CMP-1003" },
];

// ── BADGE DE ESTADO ────────────────────────────────────────────────────────────
// Componente interno que convierte el string de estado en un badge de color.
// Cada estado tiene su propio color semántico:
//   valida  → verde  (todo bien)
//   usada   → gris   (neutral, ya fue consumida)
//   anulada → rojo   (problema o cancelación)
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
const Ventas = () => {
    return (
        <main className="flex flex-col gap-6 px-6">
            <ContenedorDatos>
                <Header titulo="Lista de ventas del evento" />

                {/* Filtros con padding lateral para alinearse con la tabla */}
                <div className="px-6 mt-4">
                    <FiltroVentas />
                </div>

                <GenericTable<EntradaVenta>
                    columns={["codigoEntrada", "comprador", "fechaVenta", "estado", "canalVenta"]}
                    data={ventasMock}
                    cellRenderers={{
                      estado: (value) => <BadgeEstado estado={value} />,
                      canalVenta: (value) => <BadgeCanal canal={value} />
                    }}
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

export default Ventas;