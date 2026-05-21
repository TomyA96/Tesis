import Formulario from "../../../ui/componentes/Formulario"
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import type {Opcion} from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";

export type IngresoFormData = {
  rubroId: number;
  proveedor: string;
  fecha: string;
  monto: number;
  descripcion?: string;
};
type Modo= "crear" | "editar";
type IngresosProps = {
    rubros: Opcion[] ;
    modo:Modo;
    dataInicial?:IngresoFormData;
};

const IngresosForm = ({rubros, modo, dataInicial}: IngresosProps) => {
    rubros=[{label:"alquiler" , value:1}]
    return (
        <Formulario className="min-w-[400px]">
            <Select label="Rubro" opciones={rubros}/>
            <Input type="text" placeholder="Ingresar origen del ingreso" label="Origen del ingreso"/>
            <Input type="date" label="Fecha"/>
            <Input type="number" label="Monto" placeholder="Ingresar el monto"/>
            <textarea
                className="w-full resize-none p-2 border rounded-md"
                
                rows={4}
                placeholder="Descripción (opcional)"
            />
            <Btn>
                {modo === "crear" ? "Registrar Ingreso" : "Modificar"}
            </Btn>
        </Formulario>
    )
};
export default IngresosForm;