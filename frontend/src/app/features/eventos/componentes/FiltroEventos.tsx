import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import { opcionesEstadoEvento, type EstadoEvento, type Evento } from "../../../services/eventosService";
import { MESES } from "../../../constantes/MesesAños";

export type FiltrosEventos = {
    texto: string,
    mes: number | 0,
    estado: EstadoEvento | "",
};

export const filtrosEventosVacios: FiltrosEventos = { texto: "", mes: 0, estado: "" };

type FiltroEventosProps = {
    filtros: FiltrosEventos;
    onChange: (filtros: FiltrosEventos) => void;
};

export const aplicarFiltrosEventos = (eventos: Evento[], filtros: FiltrosEventos) => {
    const texto = filtros.texto.trim().toLowerCase();
    return eventos.filter((evento) => {
        const coincideTexto = evento.nombre.toLowerCase().includes(texto);
        const coincideMes = filtros.mes === 0 || new Date(evento.fechaHoraInicio).getMonth() + 1 === filtros.mes;
        const coincideEstado = filtros.estado === "" || evento.estado === filtros.estado;
        return coincideTexto && coincideMes && coincideEstado;
    });
}


const FiltroEventos = ({filtros, onChange }: FiltroEventosProps) => {
    return (
        <ContenedorFiltros>
            <div className="flex items-end gap-8 w-3/4">
                <Input
                    className="min-w-[400px]"
                    type="text"
                    value={filtros.texto}
                    placeholder="Introduzca el nombre de un evento"
                    onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
                />
                <Select opciones={MESES.map((m) => ({ label: m.label, value: m.value }))} label="Mes" 
                value={filtros.mes}
                onChange={(e) => onChange({ ...filtros, mes: Number(e.target.value) })}
                />
                <Select label="Estado" opciones={[{ label: "Todos", value: "" }, ...opcionesEstadoEvento]}
                value={filtros.estado}
                onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoEvento | "" })}
                
                /> 
            </div>
            <div className="flex items-end ">
                <Btn variant="outline" onClick={() => onChange(filtrosEventosVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
}

export default FiltroEventos;