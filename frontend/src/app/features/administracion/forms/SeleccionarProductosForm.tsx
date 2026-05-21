import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";

type Categoria = "comida" | "bebida"
type Productos= {
    id: number;
    nombreProducto: string;
    categoria: Categoria;
    selected: boolean;
}
type SeleccionarProductoProps= {
    productos:Productos[]
}
const SeleccionarProductosForm = ({productos=[]}: SeleccionarProductoProps) => {
    const comidas = productos.filter((p) => p.categoria === "comida")
    const bebidas = productos.filter((p) => p.categoria === "bebida")
    return(
        <Formulario className="min-w-[600px]">
            {productos.length === 0 && 
                <h1>No hay productos cargados en el sistema</h1>
            }
            <div className="grid grid-cols-2 gap-4">
                {comidas.length > 0 &&
                    <div>
                        <h1 className="text-2xl">Comidas</h1>
                        <ul className="p-2 border border-gray-200 rounded-lg bg-gray-100">
                            {comidas.map((c) => (
                                <li className="flex items-center gap-2">
                                    <Input type="checkbox"/> <span>{c.nombreProducto}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
                {bebidas.length > 0 &&
                    <div> 
                        <h1 className="text-2xl">Bebidas</h1>
                        <ul className="p-2 border border-gray-200 rounded-lg bg-gray-100">
                            {bebidas.map((b) => (
                                <li className="flex items-center gap-2">
                                    <Input type="checkbox"/> <span>{b.nombreProducto}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div>
            
        </Formulario>
    )
}
export default SeleccionarProductosForm;