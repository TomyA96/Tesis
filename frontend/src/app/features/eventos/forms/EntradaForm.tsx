import Formulario from "../../../ui/componentes/Formulario"
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import { useState } from "react";
import { createEntrada, updateEntrada, type Entrada } from "../../../services/entradasService";
import { cn } from "../../../../lib/cn";

type EntradaFormData = {

    descripcion: string;
    precio: string;
    esFisica: boolean;
    cantidad: string;
};

type EntradaFormProps = {
    idEvento: number;
    entrada?: Entrada;
    onSaved: (entrada: Entrada) => void;
    onCancel: () => void;
};

const entradaAFormulario = ( entrada?: Entrada): EntradaFormData => {
    
    const baseData: EntradaFormData = {
        descripcion: entrada?.descripcion ?? "",
        precio: String(entrada?.precio ?? ""),
        esFisica: entrada?.esFisica ?? false,
        cantidad: String(entrada?.cantidad ?? ""),
    };
    return baseData;
}

    
    


const EntradaForm = ({idEvento, entrada, onSaved, onCancel}:EntradaFormProps) => {
    const [datos, setDatos] = useState<EntradaFormData>(entradaAFormulario(entrada));
    const [error, setError] = useState<string>("");
    
   
       const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!idEvento) return;
        const entradaData = {
                
                descripcion: datos.descripcion,
                precio: parseFloat(datos.precio),
                esFisica: datos.esFisica,
                cantidad: datos.cantidad === "" ? undefined : parseInt(datos.cantidad)
        };
        
        if (entradaData.precio < 0) {
            setError("El precio del ticket no puede ser negativo");
            return;
        }
        if (entradaData.esFisica && (entradaData.cantidad === undefined || entradaData.cantidad <= 0)) {
            setError("La cantidad de entradas físicas debe ser mayor a cero");
            return;
        }
        try{
            if (!entrada){
            const entradaCreada = await createEntrada({...entradaData, idEvento});
            onSaved(entradaCreada);
            }else{
                const { esFisica, ...datosParaActualizar } = entradaData;
                const entradaActualizada = await updateEntrada(entrada.id , datosParaActualizar)
                onSaved(entradaActualizada);
            }
        }catch(error){
          
            setError(error instanceof Error ? error.message : "Error desconocido al guardar la entrada");
        }
    }

    
    
    
    return (
        <Formulario autoComplete="off" className="border border-gray-200 rounded-lg p-4 min-w-[400px]" onSubmit={onSubmit}>
            
                <Input label="Descripcion" name="descripcion" 
                    placeholder="Ej: Entrada General, VIP, etc."
                    type="text" 
                    value={datos.descripcion}
                    onChange={(e) => setDatos({ ...datos, descripcion: e.target.value})}  
                    required 
                />
                <Input label="Precio" name="precio" 
                    type="number" 
                    placeholder="Ingresar precio del ticket"
                    min={0}
                    step={1000}
                    value={datos.precio}
                    onChange={(e) => setDatos({ ...datos, precio: e.target.value})}
                    required 
                />
                <div className={cn("border border-gray-300 rounded-md p-2",  entrada ? "bg-gray-100" : "")}>
                    <strong className="text-sm font-semibold mb-2 block">Tipo de Entrada</strong>
                    <div className="flex flex-col justify-start p-2 border border-gray-300 rounded-md">
                        
                        <div className="flex items-center">
                            <Input type="radio" name="eTipo" 
                            checked={datos.esFisica === false }
                            onChange={() => setDatos({...datos, esFisica: false})}
                            disabled={(entrada) ? true : false}
                            />
                            <label className="mx-2 text-sm">Entrada Online</label>
                        </div>
                        <div className="flex items-center">
                            <Input type="radio" name="eTipo"
                            checked={datos.esFisica === true}
                            onChange={() => setDatos({...datos, esFisica: true})}
                            disabled={(entrada) ? true : false}
                            />
                            <label className="mx-2 text-sm">Entrada Física</label>
                        </div>
                        
                        
                    </div>
                </div>
                
                <div className="flex flex-col justify-start p-2 border border-gray-300 rounded-md gap-3">
                    <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold">Asignar cantidad de entradas</strong>
                        
                        
                    </div>
                    
                    <div>
                        <Input name="cantidad" type="number" placeholder="Ingresar cantidad" 
                    
                        required={datos.esFisica}
                        min={1}
                       
                        value={datos.cantidad}
                        onChange={(e) => setDatos({ ...datos, cantidad: e.target.value })}
                        />
                    </div>  
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="grid grid-cols-2 gap-4 mt-4 ">
                    <Btn type="submit" className="min-w-[150px]">Guardar</Btn>
                    <Btn variant="ghost" className="min-w-[150px]" type="button" onClick={onCancel}>Cancelar</Btn>
                </div>
            
            
        </Formulario>
    );

}
export default EntradaForm;