import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";

type CanalVenta = {
    value: string;
    label: string;
}[];

type EstadoEntrada = {
    value: string;
    label: string;
}[];

const FiltroVentas = () => {
    const canalVentaOptions: CanalVenta = [
        { value: "", label: "Todos" },
        { value: "online", label: "Online" },
        { value: "fisica", label: "Física" },
    ];
    const estadoEntradaOpciones: EstadoEntrada = [
        { value: "", label: "Todos" },
        { value: "valida", label: "Válida" },
        { value: "usada", label: "Usada" },
        { value: "anulada", label: "Anulada" },
    ]
    return (
        <ContenedorFiltros>
            <div className="flex gap-8 items-end">
                <Input  name="codigoEntrada" label="Buscar por código de venta, código de entrada o comprador" type="text" placeholder="Buscar por código de venta, código de entrada o comprador" className="min-w-[500px]" />
                
                <Select label="Estado " name="estadoEntrada" opciones={canalVentaOptions} />
                    
                <Select label="Canal de Venta" name="canalVenta" opciones={estadoEntradaOpciones} />
            </div>
            
                
            <div className="flex items-end">
                <Btn className="min-w-[120px]">Limpiar Filtros</Btn>
            </div>


        </ContenedorFiltros>
    );
}
export default FiltroVentas;