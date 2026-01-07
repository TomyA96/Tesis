import Input from "../../../ui/componentes/Input"
import Select from "../../../ui/componentes/Select"
import DateRange from "../../../ui/componentes/DateRange"
import Btn from "../../../ui/componentes/Btn"
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros"
type ResultadosProp = {
    resultado: {res: string, label: string}[];
    
}

const FiltroAuditorias = ({resultado}: ResultadosProp) => {
    return(
        <ContenedorFiltros>
            <div className="flex items-end gap-5 w-4/5">
                <div className="w-2/6">
                    <Input
                    placeholder="Buscar usuario o accion realizada"
                    className=""/>
                </div>
                <div className="">
                    <Select
                    label="Resultados"
                    opciones={[{label:"Todos", value:""}, ...resultado.map((r) => ({label: r.label, value: r.res}))]}/>
                </div>
                <div className="">
                    <DateRange/>
                </div>
            </div>
            
            <div className=" items-end ">
                <Btn className="h-full">
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
    )
    
}

export default FiltroAuditorias;