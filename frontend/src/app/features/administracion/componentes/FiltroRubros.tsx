import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import { opcionesTipoRubro, type Rubro, type TipoRubro } from "../../../services/rubrosService";

/*
    El componente solo dibuja los controles: el estado de los filtros vive en la
    página (que es la que tiene la lista completa) y el filtrado se hace en el
    navegador con aplicarFiltrosRubros. Como la cantidad de rubros es chica, no
    hace falta ir al backend por cada tecla.
*/
export type FiltrosRubros = {
    texto: string;
    tipo: TipoRubro | "";
};

export const filtrosRubrosVacios: FiltrosRubros = { texto: "", tipo: "" };

export const aplicarFiltrosRubros = (rubros: Rubro[], filtros: FiltrosRubros) => {
    const texto = filtros.texto.trim().toLowerCase();

    return rubros.filter((rubro) => {
        const coincideTexto = rubro.nombre.toLowerCase().includes(texto);
        const coincideTipo = filtros.tipo === "" || rubro.tipo === filtros.tipo;
        return coincideTexto && coincideTipo;
    });
};

type FiltroRubrosProps = {
    filtros: FiltrosRubros;
    onChange: (filtros: FiltrosRubros) => void;
};

const FiltroRubros = ({ filtros, onChange }: FiltroRubrosProps) => {
    return (
        <ContenedorFiltros>
            <div className="flex gap-6 items-end">
                <Input
                    type="text"
                    placeholder="Buscar rubro por nombre"
                    className="min-w-[400px]"
                    value={filtros.texto}
                    onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
                />
                <Select
                    label="Tipo"
                    name="tipo"
                    className="min-w-[150px]"
                    opciones={[{ label: "Todos", value: "" }, ...opcionesTipoRubro]}
                    value={filtros.tipo}
                    onChange={(e) => onChange({ ...filtros, tipo: e.target.value as TipoRubro | "" })}
                />
            </div>
            <div className="flex items-end">
                <Btn variant="outline" onClick={() => onChange(filtrosRubrosVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
};

export default FiltroRubros;
