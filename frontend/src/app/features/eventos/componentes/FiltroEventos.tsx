import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";

import type { Opcion } from "../../../ui/componentes/Select";

export type EventoEstado = "activo" | "finalizado" | "pendiente" | "cancelado";

type FiltroEventosProps = {
    meses: Opcion[];
    estados: Opcion[];
    mes: number;
    estado: EventoEstado | "";
    onMesesChange: (mes: number) => void;
    onEstadoChange: (estado: EventoEstado | "" ) => void;

};

const FiltroEventos = ({meses, estados, mes, estado, onMesesChange, onEstadoChange}: FiltroEventosProps) => {


    return (
        <ContenedorFiltros>
            <div className="flex items-end gap-8 w-3/4">
                <Input
                    className="min-w-[400px]"
                    type="text"
                    value={""}
                    placeholder="Introduzca el nombre de un evento"
                />
                <Select opciones={meses} label="Mes" 
                value={mes}
                onChange={(e) => onMesesChange(Number(e.target.value))}
                />
                <Select label="Estado" opciones={estados}
                value={estado}
                onChange={(e) => onEstadoChange(e.target.value as EventoEstado)}
                
                />
            </div>
            <div className="flex items-end ">
                <Btn>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    );
}

export default FiltroEventos;