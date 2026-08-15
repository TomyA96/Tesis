import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import {
    opcionesTipoProducto,
    opcionesEstadoProducto,
    type Producto,
    type TipoProducto,
    type EstadoProducto,
} from "../../../services/productosService";

export type FiltrosProductos = {
    texto: string;
    tipo: TipoProducto | "";
    estado: EstadoProducto | "";
};

export const filtrosProductosVacios: FiltrosProductos = { texto: "", tipo: "", estado: "" };

export const aplicarFiltrosProductos = (productos: Producto[], filtros: FiltrosProductos) => {
    const texto = filtros.texto.trim().toLowerCase();

    return productos.filter((producto) => {
        const coincideTexto = producto.nombre.toLowerCase().includes(texto);
        const coincideTipo = filtros.tipo === "" || producto.tipo === filtros.tipo;
        const coincideEstado = filtros.estado === "" || producto.estado === filtros.estado;
        return coincideTexto && coincideTipo && coincideEstado;
    });
};

type FiltroProductosProps = {
    filtros: FiltrosProductos;
    onChange: (filtros: FiltrosProductos) => void;
};

const FiltroProductos = ({ filtros, onChange }: FiltroProductosProps) => {
    return (
        <ContenedorFiltros>
            <div className="flex gap-6 items-end">
                <Input
                    type="text"
                    placeholder="Buscar producto por nombre"
                    className="min-w-[400px]"
                    value={filtros.texto}
                    onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
                />
                <Select
                    label="Tipo"
                    name="tipo"
                    className="min-w-[150px]"
                    opciones={[{ label: "Todos", value: "" }, ...opcionesTipoProducto]}
                    value={filtros.tipo}
                    onChange={(e) => onChange({ ...filtros, tipo: e.target.value as TipoProducto | "" })}
                />
                <Select
                    label="Estado"
                    name="estado"
                    className="min-w-[170px]"
                    opciones={[{ label: "Todos", value: "" }, ...opcionesEstadoProducto]}
                    value={filtros.estado}
                    onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoProducto | "" })}
                />
            </div>
            <div className="flex items-end">
                <Btn variant="outline" onClick={() => onChange(filtrosProductosVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
};

export default FiltroProductos;
