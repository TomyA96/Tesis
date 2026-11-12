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
    idJornada: number;
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

    
    


const EntradaForm = ({idJornada, entrada, onSaved, onCancel}:EntradaFormProps) => {
    const [datos, setDatos] = useState<EntradaFormData>(entradaAFormulario(entrada));
    const [error, setError] = useState<string>("");

    // Si el usuario corrige algo, el aviso anterior ya no corresponde
    const cambiar = (cambios: Partial<EntradaFormData>) => {
        setDatos((prev) => ({ ...prev, ...cambios }));
        setError("");
    };

    // Publicado el lote, sus tickets ya existen con su precio y su número: solo se corrige el nombre
    const soloNombre = !!entrada && entrada.estado !== "Borrador";

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const descripcion = datos.descripcion.trim();
        // Number("") da 0: por eso el precio vacío se controla aparte
        const precio = Number(datos.precio);
        const cantidad = Number(datos.cantidad);

        if (!descripcion) {
            setError("Ingresá una descripción para el lote");
            return;
        }
        if (datos.precio === "" || !Number.isFinite(precio) || precio < 0) {
            setError("Ingresá un precio válido (0 si es gratuita)");
            return;
        }
        if (!Number.isInteger(cantidad) || cantidad < 1) {
            setError("La cantidad tiene que ser un número entero mayor a 0");
            return;
        }

        try {
            if (!entrada) {
                onSaved(await createEntrada({ descripcion, precio, esFisica: datos.esFisica, cantidad, idJornada }));
            } else {
                // El tipo no se cambia nunca; precio y cantidad, solo en Borrador
                onSaved(await updateEntrada(entrada.id, soloNombre ? { descripcion } : { descripcion, precio, cantidad }));
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Error desconocido al guardar la entrada");
        }
    }

    return (
        // noValidate: las validaciones son las de onSubmit, así no aparecen también los globos del navegador
        <Formulario autoComplete="off" noValidate className="border border-gray-200 rounded-lg p-4 min-w-[400px]" onSubmit={onSubmit}>

                <Input label="Descripcion" name="descripcion"
                    placeholder="Ej: Entrada General, VIP, etc."
                    type="text"
                    value={datos.descripcion}
                    onChange={(e) => cambiar({ descripcion: e.target.value })}
                />
                <Input label="Precio" name="precio"
                    type="number"
                    placeholder="Ingresar precio del ticket"
                    min={0}
                    step={1000}
                    value={datos.precio}
                    disabled={soloNombre}
                    onChange={(e) => cambiar({ precio: e.target.value })}
                />
                <div className={cn("border border-gray-300 rounded-md p-2",  entrada ? "bg-gray-100" : "")}>
                    <strong className="text-sm font-semibold mb-2 block">Tipo de Entrada</strong>
                    <div className="flex flex-col justify-start p-2 border border-gray-300 rounded-md">
                        
                        <div className="flex items-center">
                            <Input type="radio" name="eTipo" 
                            checked={datos.esFisica === false }
                            onChange={() => cambiar({ esFisica: false })}
                            disabled={(entrada) ? true : false}
                            />
                            <label className="mx-2 text-sm">Entrada Online</label>
                        </div>
                        <div className="flex items-center">
                            <Input type="radio" name="eTipo"
                            checked={datos.esFisica === true}
                            onChange={() => cambiar({ esFisica: true })}
                            disabled={(entrada) ? true : false}
                            />
                            <label className="mx-2 text-sm">Entrada Física</label>
                        </div>
                        
                        
                    </div>
                </div>
                
                <div className="flex flex-col justify-start p-2 border border-gray-300 rounded-md gap-3">
                    <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold">Cantidad de tickets</strong>
                    </div>

                    <div>
                        <Input name="cantidad" type="number" placeholder="Ingresar cantidad"
                        min={1}
                        disabled={soloNombre}
                        value={datos.cantidad}
                        onChange={(e) => cambiar({ cantidad: e.target.value })}
                        />
                        <span className="text-xs text-gray-500">
                            Los tickets se crean todos juntos al publicar (online) o imprimir (física) el lote.
                        </span>
                    </div>
                </div>
                {error && <p role="alert" className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="grid grid-cols-2 gap-4 mt-4 ">
                    <Btn type="submit" className="min-w-[150px]">Guardar</Btn>
                    <Btn variant="ghost" className="min-w-[150px]" type="button" onClick={onCancel}>Cancelar</Btn>
                </div>
            
            
        </Formulario>
    );

}
export default EntradaForm;