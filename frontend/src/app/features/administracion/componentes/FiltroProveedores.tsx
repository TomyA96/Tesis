import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import { opcionesEstadoProveedor, type Proveedor, type EstadoProveedor } from "../../../services/proveedoresService";
import type { Rubro } from "../../../services/rubrosService";

export type FiltrosProveedores = {
    texto: string;
    idRubro: number | "";
    estado: EstadoProveedor | "";
};

export const filtrosProveedoresVacios: FiltrosProveedores = { texto: "", idRubro: "", estado: "" };

export const aplicarFiltrosProveedores = (proveedores: Proveedor[], filtros: FiltrosProveedores) => {
    const texto = filtros.texto.trim().toLowerCase();

    return proveedores.filter((proveedor) => {
        const coincideTexto = proveedor.nombre.toLowerCase().includes(texto);
        // El proveedor pasa el filtro si alguno de sus rubros es el elegido
        const coincideRubro =
            filtros.idRubro === "" || proveedor.rubros.some((rubro) => rubro.id === filtros.idRubro);
        const coincideEstado = filtros.estado === "" || proveedor.estado === filtros.estado;
        return coincideTexto && coincideRubro && coincideEstado;
    });
};

type FiltroProveedoresProps = {
    rubros: Rubro[];
    filtros: FiltrosProveedores;
    onChange: (filtros: FiltrosProveedores) => void;
};

const FiltroProveedores = ({ rubros, filtros, onChange }: FiltroProveedoresProps) => {
    return (
        <ContenedorFiltros>
            <div className="flex gap-6 items-end">
                <Input
                    type="text"
                    placeholder="Buscar proveedor por nombre"
                    className="min-w-[400px]"
                    value={filtros.texto}
                    onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
                />
                <Select
                    label="Rubro"
                    name="rubro"
                    className="min-w-[180px]"
                    opciones={[
                        { label: "Todos", value: "" },
                        ...rubros.map((rubro) => ({ label: rubro.nombre, value: rubro.id })),
                    ]}
                    value={filtros.idRubro}
                    onChange={(e) =>
                        onChange({ ...filtros, idRubro: e.target.value ? Number(e.target.value) : "" })
                    }
                />
                <Select
                    label="Estado"
                    name="estado"
                    className="min-w-[150px]"
                    opciones={[{ label: "Todos", value: "" }, ...opcionesEstadoProveedor]}
                    value={filtros.estado}
                    onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoProveedor | "" })}
                />
            </div>
            <div className="flex items-end">
                <Btn variant="outline" onClick={() => onChange(filtrosProveedoresVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
};

export default FiltroProveedores;
