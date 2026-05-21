import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Header from "../../../ui/componentes/Header";
import ChartCard from "../componentes/ChartCard";
import GroupedBarsMock from "../componentes/GroupedBarsMock";
import InfoPairs from "../componentes/InfoPairs";
import InsightList from "../componentes/InsightList";
import KpiBox from "../componentes/KpiBox";
import PanelEventosInforme from "../componentes/PanelEventosInforme";
import SimpleHorizontalBars from "../componentes/SimpleHorizontalBars";
import StackedProgressMock from "../componentes/StackedProgressMock";
import TabsInforme from "../componentes/TabsInforme";

type VentaProducto = {
  producto: string;
  cantidadVendida: number;
  precio: string;
  totalRecaudado: string;
};

const InformeBuffetEvento = () => {
  const comidas: VentaProducto[] = [
    { producto: "Hamburguesa", cantidadVendida: 150, precio: "$1.500", totalRecaudado: "$225.000" },
    { producto: "Choripan", cantidadVendida: 100, precio: "$1.000", totalRecaudado: "$100.000" },
    { producto: "Papas fritas", cantidadVendida: 80, precio: "$700", totalRecaudado: "$56.000" },
    { producto: "Empanadas", cantidadVendida: 60, precio: "$600", totalRecaudado: "$36.000" },
    { producto: "Pizza", cantidadVendida: 40, precio: "$800", totalRecaudado: "$32.000" },
  ];

  const bebidas: VentaProducto[] = [
    { producto: "Cerveza", cantidadVendida: 200, precio: "$1.200", totalRecaudado: "$240.000" },
    { producto: "Gaseosa (vaso)", cantidadVendida: 90, precio: "$300", totalRecaudado: "$27.000" },
    { producto: "Fernet (vaso)", cantidadVendida: 60, precio: "$500", totalRecaudado: "$30.000" },
    { producto: "Vino (vaso)", cantidadVendida: 50, precio: "$400", totalRecaudado: "$20.000" },
    { producto: "Vodka (vaso)", cantidadVendida: 30, precio: "$600", totalRecaudado: "$18.000" },
  ];

  return (
    <main className="grid grid-cols-1 gap-6 px-6 pb-8 xl:grid-cols-[290px_1fr]">
      <aside className="flex flex-col gap-6">
        <ContenedorDatos>
          <Header titulo="Contexto del buffet" />
          <div className="p-5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ano del evento
            </label>
            <select className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none">
              <option>2025</option>
            </select>
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Objetivo operativo
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Analizar ticket, rotacion y rentabilidad</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Pantalla enfocada en lectura comercial y abastecimiento para productos de mayor salida.
              </p>
            </div>
          </div>
        </ContenedorDatos>

        <PanelEventosInforme
          titulo="Eventos activos"
          eventos={[
            { nombre: "Fiesta de la Tradicion", fecha: "25 May 2025", estado: "Activo" },
            { nombre: "Concierto Rock", fecha: "08 Jun 2025", estado: "Activo" },
            { nombre: "Festival Primavera", fecha: "10 Sep 2025", estado: "Activo" },
          ]}
        />
        <PanelEventosInforme
          titulo="Eventos finalizados"
          eventos={[
            { nombre: "Fiestas Patronales", fecha: "14 Feb 2025", estado: "Finalizado" },
            { nombre: "Teatro Musical", fecha: "12 Mar 2025", estado: "Finalizado" },
          ]}
        />
      </aside>

      <section className="flex flex-col gap-6">
        <TabsInforme
          tabs={[
            { id: "entradas", label: "Entradas" },
            { id: "ventas", label: "Buffet" },
            { id: "finanzas", label: "Finanzas" },
          ]}
          activeTab="ventas"
        />

        <ContenedorDatos className="overflow-visible">
          <Header
            titulo="Resumen de ventas de buffet"
            action={
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Turno principal
              </span>
            }
          />
          <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Lectura comercial
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Consumo fuerte en bebidas y ticket medio estable en comidas.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Esta interfaz prioriza rotacion de productos, recaudacion por categoria y horarios
                de mayor demanda para anticipar stock y reforzar puntos de venta.
              </p>
              <div className="mt-6">
                <InfoPairs
                  items={[
                    { label: "Evento", value: "Fiesta de la Tradicion" },
                    { label: "Puntos de venta", value: "4 barras / 2 food stands" },
                    { label: "Horario fuerte", value: "20:00 a 23:00" },
                    { label: "Operacion", value: "Turno completo" },
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <KpiBox
                titulo="Ingresos buffet"
                valor="$1.060.000"
                descripcion="Recaudacion total del punto gastronomico"
                badge="Bruto"
                color="default"
              />
              <KpiBox
                titulo="Costo estimado"
                valor="$420.000"
                descripcion="Materia prima, personal y reposicion"
                badge="Operacion"
                color="warning"
              />
              <KpiBox
                titulo="Margen buffet"
                valor="$640.000"
                descripcion="Resultado neto proyectado del servicio"
                badge="60%"
                color="success"
              />
            </div>
          </div>
        </ContenedorDatos>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <ChartCard
            titulo="Participacion por categoria"
            subtitulo="La distribucion apilada ayuda a entender el peso real de comidas, bebidas y combos dentro del total."
          >
            <StackedProgressMock
              titulo="Composicion de ingresos"
              totalLabel="100%"
              segments={[
                { label: "Bebidas", value: 580, color: "#2563EB", helper: "Mayor volumen y velocidad de despacho" },
                { label: "Comidas", value: 360, color: "#10B981", helper: "Mayor ticket por unidad" },
                { label: "Combos", value: 120, color: "#F59E0B", helper: "Impulsan venta cruzada en picos" },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Franja horaria y consumo"
            subtitulo="Comparacion entre demanda de comida y bebida para planificar abastecimiento por turno."
          >
            <GroupedBarsMock
              max={220}
              primaryColor="#10B981"
              secondaryColor="#2563EB"
              primaryLabel="Comidas"
              secondaryLabel="Bebidas"
              data={[
                { label: "18 hs", primary: 60, secondary: 95 },
                { label: "20 hs", primary: 135, secondary: 210 },
                { label: "22 hs", primary: 120, secondary: 220 },
                { label: "00 hs", primary: 75, secondary: 140 },
              ]}
            />
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.75fr]">
          <ChartCard
            titulo="Top comidas"
            subtitulo="Productos de mejor salida para orientar cocina y preelaborado."
          >
            <SimpleHorizontalBars
              max={160}
              colorClass="bg-emerald-500"
              data={[
                { label: "Hamburguesa", value: 150, helper: "Producto lider del menu" },
                { label: "Choripan", value: 100, helper: "Alta salida en segunda franja" },
                { label: "Papas fritas", value: 80, helper: "Compra de acompanamiento" },
                { label: "Empanadas", value: 60, helper: "Venta rapida en mostrador" },
                { label: "Pizza", value: 40, helper: "Consumo moderado" },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Top bebidas"
            subtitulo="La barra horizontal permite leer rapido ranking y diferencia entre categorias."
          >
            <SimpleHorizontalBars
              max={220}
              colorClass="bg-blue-500"
              data={[
                { label: "Cerveza", value: 200, helper: "Mayor rotacion general" },
                { label: "Gaseosa", value: 90, helper: "Compra familiar y acompane" },
                { label: "Fernet", value: 60, helper: "Pico nocturno" },
                { label: "Vino", value: 50, helper: "Ticket medio estable" },
                { label: "Vodka", value: 30, helper: "Bajo volumen premium" },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Insights de buffet"
            subtitulo="Lectura sintetica para decisiones de stock y staffing."
          >
            <InsightList
              items={[
                { label: "Mayor demanda", value: "22 hs", helper: "Coincide con pico de bebidas" },
                { label: "Producto estrella", value: "Cerveza", helper: "Maxima rotacion en todas las barras" },
                { label: "Venta cruzada", value: "Combos", helper: "Oportunidad para subir ticket medio" },
              ]}
            />
          </ChartCard>
        </section>

        <section className="grid gap-6">
          <ContenedorDatos>
            <Header titulo="Detalle de comidas" />
            <GenericTable<VentaProducto>
              columns={["producto", "cantidadVendida", "precio", "totalRecaudado"]}
              data={comidas}
            />
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-sm font-semibold text-slate-700">
              Total recaudado en comidas: <span className="ml-2 text-slate-900">$449.000</span>
            </div>
          </ContenedorDatos>

          <ContenedorDatos>
            <Header titulo="Detalle de bebidas" />
            <GenericTable<VentaProducto>
              columns={["producto", "cantidadVendida", "precio", "totalRecaudado"]}
              data={bebidas}
            />
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-sm font-semibold text-slate-700">
              Total recaudado en bebidas: <span className="ml-2 text-slate-900">$335.000</span>
            </div>
          </ContenedorDatos>
        </section>
      </section>
    </main>
  );
};

export default InformeBuffetEvento;
