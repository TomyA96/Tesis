import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import CategoriaProductos from "../componentes/CategoriaProductos";
import ResumenOrdenItem from "../componentes/ResumenOrdenItem";
import { CreditCard, QrCode, Receipt, Wallet } from "lucide-react";

const bebidas = [
  {
    nombre: "Cerveza tirada",
    precio: "$2.500",
    descripcion: "Pinta fria para despacho rapido en barra.",
    color: "from-blue-600 to-sky-400",
  },
  {
    nombre: "Jarra de fernet",
    precio: "$4.800",
    descripcion: "Presentacion para grupos con ticket medio alto.",
    color: "from-slate-800 to-slate-600",
  },
  {
    nombre: "Gaseosa 500ml",
    precio: "$1.200",
    descripcion: "Opcion de alta rotacion para consumo general.",
    color: "from-cyan-500 to-blue-500",
  },
];

const comidas = [
  {
    nombre: "Hamburguesa completa",
    precio: "$3.600",
    descripcion: "Producto estrella del stand principal.",
    color: "from-amber-500 to-orange-400",
  },
  {
    nombre: "Choripan",
    precio: "$2.800",
    descripcion: "Salida rapida en picos de demanda.",
    color: "from-rose-500 to-orange-400",
  },
  {
    nombre: "Papas fritas",
    precio: "$1.900",
    descripcion: "Acompanamiento frecuente en combos.",
    color: "from-yellow-500 to-amber-300",
  },
];

const postres = [
  {
    nombre: "Helado artesanal",
    precio: "$1.700",
    descripcion: "Formato individual para venta de impulso.",
    color: "from-fuchsia-500 to-pink-400",
  },
  {
    nombre: "Brownie",
    precio: "$1.300",
    descripcion: "Opcional dulce de ticket corto.",
    color: "from-violet-500 to-purple-400",
  },
];

const PanelVentas = () => {
  return (
    <main className="px-6 pb-8">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <ContenedorDatos className="h-fit xl:sticky xl:top-4">
          <Header
            titulo="Orden actual"
            action={
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Caja activa
              </span>
            }
          />
          <div className="p-6">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Orden
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">#2197</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Fecha
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">25/05/2025 22:14</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-[1.3fr_64px_88px_88px] gap-3 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span>Producto</span>
                <span className="text-center">Cant.</span>
                <span className="text-right">Precio</span>
                <span className="text-right">Total</span>
              </div>
              <ResumenOrdenItem producto="Hamburguesa completa" cantidad={2} precioUnitario="$3.600" total="$7.200" />
              <ResumenOrdenItem producto="Jarra de fernet" cantidad={1} precioUnitario="$4.800" total="$4.800" />
              <ResumenOrdenItem producto="Papas fritas" cantidad={1} precioUnitario="$1.900" total="$1.900" />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>$13.900</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                <span>Descuentos</span>
                <span>$0</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Total</span>
                <span className="text-3xl font-bold tracking-tight text-slate-900">$13.900</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Metodo de pago
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Btn variant="outline" className="justify-center gap-2"><Wallet className="h-4 w-4" />Efectivo</Btn>
                <Btn variant="outline" className="justify-center gap-2"><CreditCard className="h-4 w-4" />Tarjeta</Btn>
                <Btn variant="outline" className="justify-center gap-2"><QrCode className="h-4 w-4" />QR</Btn>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Btn variant="success" size="lg" className="justify-center gap-2">
                <Receipt className="h-4 w-4" />
                Finalizar Compra
              </Btn>
              <Btn variant="danger" size="lg">
                Cancelar
              </Btn>
            </div>
          </div>
        </ContenedorDatos>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-7 py-5">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Catalogo de productos</h1>
            <p className="mt-1 text-sm text-slate-500">
              Seleccion rapida por categoria para despachar pedidos desde caja.
            </p>
          </div>

          <div className="space-y-8 p-6">
            <CategoriaProductos
              titulo="Bebidas"
              descripcion="Productos de rotacion alta para despacho en barra."
              productos={bebidas}
            />
            <CategoriaProductos
              titulo="Comidas"
              descripcion="Opciones principales de cocina y mostrador."
              productos={comidas}
            />
            <CategoriaProductos
              titulo="Postres"
              descripcion="Complementos dulces para ampliar el ticket medio."
              productos={postres}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PanelVentas;
