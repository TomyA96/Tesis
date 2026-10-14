import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import {
    opcionesEstadoFuenteIngreso,
    type FuenteIngreso,
    type EstadoFuenteIngreso,
} from "../../../services/fuentesIngresoService";
import type { Rubro } from "../../../services/rubrosService";

export type FiltrosFuentesIngreso = {
    texto: string;
    idRubro: number | "";
    estado: EstadoFuenteIngreso | "";
};

export const filtrosFuentesIngresoVacios: FiltrosFuentesIngreso = { texto: "", idRubro: "", estado: "" };

export const aplicarFiltrosFuentesIngreso = (fuentes: FuenteIngreso[], filtros: FiltrosFuentesIngreso) => {
    const texto = filtros.texto.trim().toLowerCase();

    return fuentes.filter((fuente) => {
        const coincideTexto = fuente.nombre.toLowerCase().includes(texto);
        const coincideRubro =
            filtros.idRubro === "" || fuente.rubros.some((rubro) => rubro.id === filtros.idRubro);
        const coincideEstado = filtros.estado === "" || fuente.estado === filtros.estado;
        return coincideTexto && coincideRubro && coincideEstado;
    });
};

type FiltroFuentesIngresoProps = {
    rubros: Rubro[];
    filtros: FiltrosFuentesIngreso;
    onChange: (filtros: FiltrosFuentesIngreso) => void;
};

const FiltroFuentesIngreso = ({ rubros, filtros, onChange }: FiltroFuentesIngresoProps) => {
    return (
        <ContenedorFiltros>
            <div className="flex gap-6 items-end">
                <Input
                    type="text"
                    placeholder="Buscar fuente por nombre"
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
                    opciones={[{ label: "Todos", value: "" }, ...opcionesEstadoFuenteIngreso]}
                    value={filtros.estado}
                    onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoFuenteIngreso | "" })}
                />
            </div>
            <div className="flex items-end">
                <Btn variant="outline" onClick={() => onChange(filtrosFuentesIngresoVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
};

export default FiltroFuentesIngreso;
