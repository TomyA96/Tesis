import Formulario from "../../../ui/componentes/Formulario"
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import { useState } from "react";

const EntradaForm = () => {
    const [isCantidadEnabled, setIsCantidadEnabled] = useState(false);
    const [cantidad, setCantidad] = useState<number | null>(null);
    const [entradaTipo, setEntradaTipo] = useState<"online" | "fisica">("online");
    
    return (
        <Formulario autoComplete="off" className="border border-gray-200 rounded-lg p-4 min-w-[400px]">
            
                <Input label="Nombre Entrada" name="nombreEntrada" type="text"  required />
                <Input label="Precio" name="precio" type="number" required />
                <div className="border border-gray-300 rounded-md p-2">
                    <strong className="text-sm font-semibold mb-2 block">Tipo de Entrada</strong>
                    <div className="flex flex-col justify-start p-2 border border-gray-300 rounded-md ">
                        
                        <div className="flex items-center">
                            <Input type="radio" name="eTipo" 
                            checked={entradaTipo === "online"}
                            onChange={() => setEntradaTipo("online")}
                            />
                            <label className="mx-2 text-sm">Entrada Online</label>
                        </div>
                        <div className="flex items-center">
                            <Input type="radio" name="eTipo"
                            checked={entradaTipo === "fisica"}
                            onChange={() => setEntradaTipo("fisica")}
                            />
                            <label className="mx-2 text-sm">Entrada Física</label>
                        </div>
                        
                        
                    </div>
                </div>
                
                <div className="flex flex-col justify-start p-2 border border-gray-300 rounded-md gap-3">
                    <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold">Asignar cantidad de entradas</strong>
                        <input type="checkbox" name="estadoCantidad" className="w-3 h-3" checked={isCantidadEnabled} 
                        onChange={() => 
                             setIsCantidadEnabled(cePrev => { if (cePrev === false) { setCantidad(null)} return !cePrev})}         
                        />
                    </div>
                    
                    <div>
                        <Input name="cantidad" type="number" placeholder="Ingresar cantidad" readOnly={!isCantidadEnabled}
                        className={isCantidadEnabled ? "" : "bg-gray-100 cursor-not-allowed"}
                        value={cantidad ?? ""}
                        onChange={(ctd) => setCantidad(Number(ctd.target.value))}
                        />
                    </div>  
                </div>

                <div className="flex justify-between gap-4 mt-4 ">
                    <Btn type="submit" className="min-w-[150px]" >Guardar</Btn>
                    <Btn variant="ghost" className="min-w-[150px]" type="reset" >Cancelar</Btn>
                </div>
            
            
        </Formulario>
    );

}
export default EntradaForm;