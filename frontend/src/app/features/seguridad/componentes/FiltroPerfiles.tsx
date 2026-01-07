import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";
import Btn from "../../../ui/componentes/Btn";
type FiltroPerfilesProps = {
    
    areas: { id: number; nombre: string }[];
}



const FiltroPerfiles = ({areas}: FiltroPerfilesProps) => {
    return(
        <ContenedorFiltros>
            <div className="flex gap-6 items-end min-w-1/2">
                <Input 
                type="text"
                value={""}
                placeholder="Buscar perfil por nombre o permiso"
                className="min-w-[500px]"
                />
                <Select 
                label="Areas"
                
                value={""}
                opciones={[{label: "Todas", value:""},...areas.map((a) =>( {label: a.nombre, value: a.id} ))]}
                />
            </div>
            <div className="flex items-end">
                <Btn >
                    Limpiar Filtros
                </Btn>
            </div>
            
        </ContenedorFiltros>
    );


}
export default FiltroPerfiles;