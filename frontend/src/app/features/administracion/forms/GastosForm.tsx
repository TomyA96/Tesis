import Formulario from "../../../ui/componentes/Formulario";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import type {Opcion} from "../../../ui/componentes/Select";

export type GastoFormData = {
  rubroId: number;
  proveedorId: number;
  fecha: string;
  monto: number;
  descripcion?: string;
};
type Modo= "crear" | "editar";

type GastosProps = {
    rubros: Opcion[] ;
    proveedores: Opcion[];
    modo:Modo;
    dataInicial?:GastoFormData;
}



const GastosForm = ({ rubros, proveedores, modo, dataInicial }: GastosProps) => {
    rubros=[{label:"alquiler" , value:1}]
    proveedores=[{label:"Juancito", value:1}]
    return(
        <Formulario className="min-w-[400px]">

            <Select label="Rubro" opciones={rubros}/>
            <Select label="Proveedor" opciones={proveedores}/>
            <Input type="date" label="Fecha"/>
            <Input type="number" label="Monto" placeholder="Ingresar el monto"/>
            <textarea
                className="w-full resize-none p-2 border rounded-md"
                
                rows={4}
                placeholder="Descripción (opcional)"
            />
            <Btn>
                {modo === "crear" ? "Registrar Gasto" : "Modificar"}
            </Btn>
        </Formulario>
    )
};
export default GastosForm;