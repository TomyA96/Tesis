import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTabla";
import FiltroVentas from "../componentes/FiltroVentas";

type EstadoEntrada = "valida" | "usada" | "anulada";
type CanalVenta = "online" | "fisica";

type EntradaVenta = {
  id: string;
  codigoEntrada: string;
  estado: EstadoEntrada;
  canalVenta: CanalVenta;
  fechaVenta: string;
  comprador: string;
  compraId: string; // interno (para agrupar)
};

export const ventasMock: EntradaVenta[] = [
  {
    id: "1",
    codigoEntrada: "EVT-9F3A2",
    estado: "valida",
    canalVenta: "online",
    fechaVenta: "2026-03-10 18:32",
    comprador: "Juan Pérez",
    compraId: "CMP-1001",
  },
  {
    id: "2",
    codigoEntrada: "EVT-9F3A3",
    estado: "valida",
    canalVenta: "online",
    fechaVenta: "2026-03-10 18:32",
    comprador: "Juan Pérez",
    compraId: "CMP-1001",
  },
  {
    id: "3",
    codigoEntrada: "EVT-9F3A4",
    estado: "usada",
    canalVenta: "fisica",
    fechaVenta: "2026-03-11 21:10",
    comprador: "María González",
    compraId: "CMP-1002",
  },
  {
    id: "4",
    codigoEntrada: "EVT-7B2C9",
    estado: "valida",
    canalVenta: "online",
    fechaVenta: "2026-03-12 09:45",
    comprador: "Lucas Fernández",
    compraId: "CMP-1003",
  },
  {
    id: "5",
    codigoEntrada: "EVT-7B2D0",
    estado: "anulada",
    canalVenta: "online",
    fechaVenta: "2026-03-12 09:45",
    comprador: "Lucas Fernández",
    compraId: "CMP-1003",
  },
];

export default function Ventas () {

    return (
        <main>
            <ContenedorDatos className="mb-4">
                <h1 className="text-2xl font-semibold">Lista de ventas del evento</h1>
                
            </ContenedorDatos>
            <ContenedorDatos>
                <FiltroVentas />
                <GenericTable
                    columns={["codigoEntrada", "estado","canalVenta", "fechaVenta", "comprador"]}
                    data={ventasMock}
                    actions={(_row) => (
                        <Btn variant="primary" size="sm">
                            Visualizar
                        </Btn>
                    )}
                />
            </ContenedorDatos>
        </main> 
        
    );
};
