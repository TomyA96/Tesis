import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import Input from "../../../ui/componentes/Input";
import { Ticket } from "lucide-react";

const VentaEntradas = () => {
  return (
    <main className="px-6 pb-8">
      <div className="mx-auto max-w-4xl">
        <ContenedorDatos className="overflow-visible">
          <Header titulo="Venta de entradas" />
          <div className="grid gap-6 p-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 p-6 text-white shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
                <Ticket className="h-4 w-4" />
                Punto de venta
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Registra una venta manual de forma rapida y limpia.
              </h2>
              <p className="mt-3 text-sm leading-6 text-blue-50/95">
                Ingrese el codigo de la entrada y confirme la venta desde este panel operativo.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <Input
                  label="Codigo de la entrada"
                  name="codigoEntrada"
                  placeholder="Ej: EVT-2026-000145"
                  autoComplete="off"
                />
                <Btn className="w-full justify-center" size="lg">
                  Vender Entrada
                </Btn>
              </div>
            </div>
          </div>
        </ContenedorDatos>
      </div>
    </main>
  );
};

export default VentaEntradas;
