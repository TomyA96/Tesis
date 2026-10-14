import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Header from "../../../ui/componentes/Header";
import ChartCard from "../componentes/ChartCard";
import GroupedBarsMock from "../componentes/GroupedBarsMock";
import InfoPairs from "../componentes/InfoPairs";
import InsightList from "../componentes/InsightList";
import KpiBox from "../componentes/KpiBox";
import PanelEventosInforme from "../componentes/PanelEventosInforme";
import PieChartMock from "../componentes/PieChartMock";
import SimpleHorizontalBars from "../componentes/SimpleHorizontalBars";
import SimpleVerticalBars from "../componentes/SimpleVerticalBars";
import StackedProgressMock from "../componentes/StackedProgressMock";
import TabsInforme from "../componentes/TabsInforme";

type TipoEntrada = {
  tipoEntrada: string;
  precio: string;
  cantidadVendida: number;
  facturacion: string;
};

const InformeEntradasEvento = () => {
  const tiposEntrada: TipoEntrada[] = [
    { tipoEntrada: "General Pre-venta", precio: "$8.000", cantidadVendida: 500, facturacion: "$4.000.000" },
    { tipoEntrada: "General Tanda 1", precio: "$10.000", cantidadVendida: 300, facturacion: "$3.000.000" },
    { tipoEntrada: "General Tanda 2", precio: "$12.000", cantidadVendida: 400, facturacion: "$4.800.000" },
    { tipoEntrada: "VIP", precio: "$20.000", cantidadVendida: 20, facturacion: "$400.000" },
  ];

  return (
    <main className="grid grid-cols-1 gap-6 px-6 pb-8 xl:grid-cols-[290px_1fr]">
      <aside className="flex flex-col gap-6">
        <ContenedorDatos>
          <Header titulo="Contexto de consulta" />
          <div className="p-5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ano del evento
            </label>
            <select className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none">
              <option>2025</option>
            </select>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Estado del reporte
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Vista lista para analisis</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Disenada para lectura rapida de ocupacion, ventas y composicion por lote.
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsInforme
            tabs={[
              { id: "entradas", label: "Entradas" },
              { id: "ventas", label: "Ventas" },
              { id: "finanzas", label: "Finanzas" },
            ]}
            activeTab="entradas"
          />
          <Btn variant="outline">Exportar reporte</Btn>
        </div>

        <ContenedorDatos className="overflow-visible">
          <Header
            titulo="Reporte de venta de entradas"
            action={
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Evento seleccionado
              </span>
            }
          />
          <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Evento principal
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Fiesta de la Tradicion</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Vista orientada a control comercial y operativo: ritmo de venta, mix de lotes,
                ocupacion esperada y conversion de ingresos por canal.
              </p>
              <div className="mt-6">
                <InfoPairs
                  items={[
                    { label: "Fecha", value: "25/05/2025" },
                    { label: "Hora", value: "12:00" },
                    { label: "Lugar", value: "Cancha ADEA" },
                    { label: "Capacidad", value: "2.000 personas" },
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <KpiBox
                titulo="Entradas emitidas"
                valor="1.220"
                descripcion="Volumen total confirmado al cierre"
                badge="Stock activo"
              />
              <KpiBox
                titulo="Check-ins"
                valor="812"
                descripcion="Ingresos ya validados en acceso"
                badge="66%"
                color="success"
              />
              <KpiBox
                titulo="Pendientes"
                valor="408"
                descripcion="Entradas vendidas aun no utilizadas"
                badge="Seguimiento"
                color="warning"
              />
            </div>
          </div>
        </ContenedorDatos>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ChartCard
            titulo="Estado de ocupacion"
            subtitulo="Donut central para lectura instantanea y composicion complementaria de asistencia."
          >
            <div className="grid items-center gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <PieChartMock
                donut
                size="md"
                centerLabel="Ocupacion"
                centerValue="61%"
                segments={[
                  { color: "#2563EB", value: 812 },
                  { color: "#F59E0B", value: 408 },
                  { color: "#E2E8F0", value: 780 },
                ]}
              />
              <StackedProgressMock
                totalLabel="Capacidad"
                segments={[
                  { label: "Ingresados", value: 812, color: "#2563EB", helper: "Check-ins ya validados" },
                  { label: "Vendidos sin usar", value: 408, color: "#F59E0B", helper: "Tickets activos pendientes" },
                  { label: "Disponibles", value: 780, color: "#E2E8F0", helper: "Capacidad restante del evento" },
                ]}
              />
            </div>
          </ChartCard>

          <ChartCard
            titulo="Ritmo de venta"
            subtitulo="Agrupacion semanal para detectar en que tramo del calendario se acelero la demanda."
          >
            <GroupedBarsMock
              max={700}
              primaryColor="#2563EB"
              secondaryColor="#0F172A"
              primaryLabel="Entradas vendidas"
              secondaryLabel="Meta esperada"
              data={[
                { label: "Semana -4", primary: 220, secondary: 240 },
                { label: "Semana -3", primary: 190, secondary: 220 },
                { label: "Semana -2", primary: 620, secondary: 540 },
                { label: "Semana -1", primary: 300, secondary: 320 },
                { label: "Dia evento", primary: 95, secondary: 110 },
              ]}
            />
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.7fr_0.7fr_0.95fr]">
          <ChartCard
            titulo="Canales de venta"
            subtitulo="La comparacion por canal se entiende mejor como ranking directo."
          >
            <SimpleHorizontalBars
              max={900}
              colorClass="bg-blue-600"
              data={[
                { label: "Canal online", value: 860, helper: "Principal punto de conversion" },
                { label: "Boleteria", value: 260, helper: "Venta de cercania y ultimo tramo" },
                { label: "Invitaciones", value: 100, helper: "Cupos institucionales" },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Horario de conversion"
            subtitulo="Una barra simple por franja permite ver rapido donde se activa la demanda."
          >
            <SimpleVerticalBars
              max={100}
              showValues
              colorClass="bg-gradient-to-t from-slate-900 to-slate-500"
              data={[
                { label: "08 hs", value: 42 },
                { label: "12 hs", value: 58 },
                { label: "16 hs", value: 73 },
                { label: "20 hs", value: 91 },
                { label: "22 hs", value: 64 },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Mix de entradas"
            subtitulo="Para comparar volumen entre lotes, una barra horizontal resulta mas precisa que una torta."
          >
            <div className="grid gap-5">
              <SimpleHorizontalBars
                max={550}
                colorClass="bg-fuchsia-500"
                data={[
                  { label: "General Pre-venta", value: 500, helper: "41% del total emitido" },
                  { label: "General Tanda 2", value: 400, helper: "Mayor facturacion por volumen" },
                  { label: "General Tanda 1", value: 300, helper: "Tramo medio de conversion" },
                  { label: "VIP", value: 20, helper: "Bajo volumen, alto ticket medio" },
                ]}
              />
              <InsightList
                items={[
                  { label: "Lote dominante", value: "Pre-venta", helper: "Concentra la mayor cantidad vendida" },
                  { label: "Mejor equilibrio", value: "Tanda 2", helper: "Combina precio mas alto y buena salida" },
                  { label: "Segmento premium", value: "VIP", helper: "Poca cantidad con aporte unitario alto" },
                ]}
              />
            </div>
          </ChartCard>
        </section>

        <ContenedorDatos>
          <Header
            titulo="Detalle por tipo de entrada"
            action={
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Datos de muestra
              </span>
            }
          />
          <GenericTable<TipoEntrada>
            columns={["tipoEntrada", "precio", "cantidadVendida", "facturacion"]}
            data={tiposEntrada}
          />
        </ContenedorDatos>
      </section>
    </main>
  );
};

export default InformeEntradasEvento;
