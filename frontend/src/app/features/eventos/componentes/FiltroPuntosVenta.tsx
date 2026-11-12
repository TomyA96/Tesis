import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import { opcionesEstadoPuntoVenta, type PuntoVenta, type EstadoPuntoVenta } from "../../../services/puntosVentaService";

export type FiltrosPuntosVenta = {
    texto: string;
    estado: EstadoPuntoVenta | "";
};

export const filtrosPuntosVentaVacios: FiltrosPuntosVenta = { texto: "", estado: "" };

export const aplicarFiltrosPuntosVenta = (puntos: PuntoVenta[], filtros: FiltrosPuntosVenta) => {
    const texto = filtros.texto.trim().toLowerCase();

    return puntos.filter((punto) => {
        const coincideTexto = punto.nombre.toLowerCase().includes(texto);
        const coincideEstado = filtros.estado === "" || punto.estado === filtros.estado;
        return coincideTexto && coincideEstado;
    });
};

type FiltroPuntosVentaProps = {
    filtros: FiltrosPuntosVenta;
    onChange: (filtros: FiltrosPuntosVenta) => void;
};

const FiltroPuntosVenta = ({ filtros, onChange }: FiltroPuntosVentaProps) => {
    return (
        <ContenedorFiltros>
            <div className="flex gap-6 items-end">
                <Input
                    type="text"
                    placeholder="Buscar punto de venta por nombre"
                    className="min-w-[400px]"
                    value={filtros.texto}
                    onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
                />
                <Select
                    label="Estado"
                    name="estado"
                    className="min-w-[150px]"
                    opciones={[{ label: "Todos", value: "" }, ...opcionesEstadoPuntoVenta]}
                    value={filtros.estado}
                    onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoPuntoVenta | "" })}
                />
            </div>
            <div className="flex items-end">
                <Btn variant="outline" onClick={() => onChange(filtrosPuntosVentaVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
};

export default FiltroPuntosVenta;
