import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import SeccionProductos from "../componentes/SeccionProductos";
import Header from "../../../ui/componentes/Header";
 
type Producto = {
    nombre: string;
    precio: number;
};
 
const comidas: Producto[] = [
    { nombre: "Empanada de carne",        precio: 450  },
    { nombre: "Milanesa con papas",       precio: 1200 },
    { nombre: "Pizza muzza",              precio: 850  },
    { nombre: "Taco de pollo",            precio: 950  },
    { nombre: "Choripán",                 precio: 650  },
    { nombre: "Ensalada de quinoa",       precio: 780  },
    { nombre: "Sándwich de jamón y queso", precio: 680 },
    { nombre: "Papas rústicas",           precio: 520  },
];
 
const bebidas: Producto[] = [
    { nombre: "Cerveza artesanal",        precio: 520 },
    { nombre: "Gaseosa 500ml",            precio: 320 },
    { nombre: "Agua saborizada",          precio: 280 },
    { nombre: "Café espresso",            precio: 250 },
    { nombre: "Mojito sin alcohol",       precio: 410 },
    { nombre: "Limonada casera",          precio: 330 },
    { nombre: "Jugo natural de naranja",  precio: 360 },
    { nombre: "Té helado",                precio: 300 },
];
 
// ── COMPONENTE INTERNO: SECCIÓN DE CATEGORÍA ──────────────────────────────────
// Extraemos la sección en su propio componente para no repetir
// el mismo bloque de JSX dos veces (Comidas y Bebidas son idénticas en estructura)

 
// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
const Productos = () => {
    return (
        <main className="flex flex-col gap-6 px-6">
            <ContenedorDatos>
                <Header titulo="Productos" action={<Btn>+ Agregar Producto</Btn>} />
 
                {/*
                    flex + gap-0: las dos secciones están en fila.
                    divide-x divide-gray-100: agrega una línea vertical entre ellas
                    sin necesidad de agregar un div separador manualmente.
                    px-6 pb-6: padding interno de la zona de tablas
                */}
                <div className="flex divide-x divide-gray-100 px-6 pb-6 pt-2">
                    <div className="flex-1 min-w-0 pr-6">
                        <SeccionProductos
                            titulo="Comidas"
                            data={comidas}
                            mostrarAcciones
                        />
                    </div>
                    <div className="flex-1 min-w-0 pl-6">
                        <SeccionProductos
                            titulo="Bebidas"
                            data={bebidas}
                            mostrarAcciones
                        />
                    </div>
                </div>
 
            </ContenedorDatos>
        </main>
    );
};
 
export default Productos;
