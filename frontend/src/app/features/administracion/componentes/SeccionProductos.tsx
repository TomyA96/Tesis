import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Btn from "../../../ui/componentes/Btn";
type Producto = {
    nombre: string;
    precio: number;
};
type SeccionProductosProps = {
    titulo: string;
    data: Producto[];
    // mostrarAcciones controla si esta categoría tiene botones de acción
    mostrarAcciones?: boolean;
};
 
const SeccionProductos = ({ titulo, data, mostrarAcciones = false }: SeccionProductosProps) => {
    return (
        /*
            flex-1: ocupa TODO el espacio disponible dentro del flex padre.
            min-w-0: permite que el elemento se encoja si es necesario.
            SIN estos dos, cada sección toma solo el ancho de su contenido
            y las tablas quedan chicas — este era tu problema principal.
        */
        <div className="flex-1 min-w-0">
 
            {/* Encabezado de sección con separador visual */}
            <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-semibold text-gray-800 whitespace-nowrap">
                    {titulo}
                </h2>
                {/*
                    flex-1: la línea ocupa todo el espacio que sobra a la derecha del título
                    Esto crea un separador horizontal elegante sin usar <hr>
                */}
                <div className="flex-1 h-px bg-gray-200" />
            </div>
 
            <GenericTable<Producto>
                columns={["nombre", "precio"]}
                data={data}
                actions={mostrarAcciones ? (_row) => (
                    <div className="flex gap-2">
                        <Btn variant="outline" size="sm">Editar</Btn>
                        <Btn variant="danger"  size="sm">Eliminar</Btn>
                    </div>
                ) : undefined}
            />
        </div>
    );
};
export default SeccionProductos;