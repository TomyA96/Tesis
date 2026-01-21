import Btn from "../../../ui/componentes/Btn";


const LoteEntrada = () => {
    let tipoEntrada = "fisic";
    return (
        <div className="flex justify-between border border-gray-200 rounded-lg p-4 overflow-hidden items-center ">
            <div className="flex flex-col ">
                <h1 className="font-semibold text-2xl mb-2">Nombre Lote</h1>
                <div className="mt-auto">
                    
                    <h4 className="flex justify-between items-end max-w-[120px] "><strong className="mr-2  text-sm">Cantidad:</strong><p className="text-sm">0/300</p></h4>
                    <h4 className="flex justify-between items-end max-w-[120px] "><strong className="mr-2  text-sm">Precio:</strong><p className="text-sm">$0.00</p></h4>
                    <h4 className="flex justify-between items-end max-w-[120px] "><strong className="mr-2  text-sm">Estado:</strong><p className="text-sm">Borrador</p></h4>
                    
                </div>
                
            </div>
            
            {tipoEntrada !== "fisica" ? 
                (<div className="flex flex-col gap-2">
                
                    <Btn size="sm" className="">Editar Lote</Btn>
                    <Btn variant="ghost" size="sm" className="">Eliminar Lote</Btn>
                    <Btn variant="success" size="sm" className="">Publicar/Deshabilitar</Btn>
                </div>)
             : 
                (<div className="flex flex-col gap-2">
                    <Btn size="sm" className="">Editar Lote</Btn>
                    <Btn size="sm" variant="secondary">Imprimir</Btn>
                </div>)
            }
        </div>
    
    );
}
export default LoteEntrada;