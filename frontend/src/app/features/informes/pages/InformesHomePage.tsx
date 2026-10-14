import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Header from "../../../ui/componentes/Header";
import ChartCard from "../componentes/ChartCard";
import GroupedBarsMock from "../componentes/GroupedBarsMock";
import InsightList from "../componentes/InsightList";
import KpiBox from "../componentes/KpiBox";
import SimpleHorizontalBars from "../componentes/SimpleHorizontalBars";
import SimpleVerticalBars from "../componentes/SimpleVerticalBars";
import TabsInforme from "../componentes/TabsInforme";

type FilaEvento = {
  nombre: string;
  fecha: string;
  asistentes: string;
  costoTotal: string;
  totalRecaudado: string;
  margen: string;
};

const InformesResumenAnual = () => {
  const eventos: FilaEvento[] = [
    {
      nombre: "Festival Primavera",
      fecha: "10 Mar 2025",
      asistentes: "1.240",
      costoTotal: "$150.000",
      totalRecaudado: "$480.000",
      margen: "68%",
    },
    {
      nombre: "Concierto Rock",
      fecha: "12 Abr 2025",
      asistentes: "980",
      costoTotal: "$120.000",
      totalRecaudado: "$320.000",
      margen: "62%",
    },
    {
      nombre: "Teatro Musical",
      fecha: "09 Jul 2025",
      asistentes: "740",
      costoTotal: "$82.000",
      totalRecaudado: "$210.000",
      margen: "60%",
    },
  ];

  return (
    <main className="flex flex-col gap-6 px-6 pb-8">
      <ContenedorDatos className="overflow-visible">
        {/* ── HEADER Y FILTROS ──────────────────────────────────────────────── 
          Falta darle logica y llenar el select con los años disponibles en la base de datos.
        */}
        <Header
          titulo="Resumen anual de informes"
          action={
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">Periodo</span>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none">
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
          }
        />
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr]">
          

          <div className="flex flex-col justify-between rounded-[28px] border border-slate-200  from-slate-50 to-white p-6 shadow-sm">
            {/* ── TABS ────────────────────────────────────────────────
            Falta darle logica para cambiar el contenido segun la pestaña activa.
            */}
            <TabsInforme
              tabs={[
                { id: "general", label: "General" },
                { id: "finanzas", label: "Finanzas" },
                { id: "ocupacion", label: "Ocupacion" },
              ]}
              activeTab="general"
            />

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Evento mas rentable
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">Festival Primavera</p>
                <p className="mt-1 text-sm text-slate-500">Ingreso neto estimado: $330.000</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Observacion del periodo
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Los eventos medianos mantuvieron mejor margen operativo que los de gran escala,
                  especialmente cuando el buffet y los sponsors compensaron el costo fijo.
                </p>
              </div>
            </div>
          </div>
          <ChartCard
          titulo="Contribucion a la ganancia"
          subtitulo="Para comparar aporte entre eventos, la lectura horizontal es mas clara que una torta."
        >
          <SimpleHorizontalBars
            max={50}
            valueSuffix="%"
            colorClass="bg-blue-600"
            data={[
              {
                label: "Festival Primavera",
                value: 46,
                helper: "Mayor venta y mejor ticket medio",
              },
              {
                label: "Concierto Rock",
                value: 31,
                helper: "Buen margen por sponsors",
              },
              {
                label: "Teatro Musical",
                value: 23,
                helper: "Fecha estable con menor capacidad",
              },
            ]}
          />
        </ChartCard>
        </div>
      </ContenedorDatos>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiBox
          titulo="Total recaudado"
          valor="$1.250.000"
          descripcion="Suma anual consolidada de eventos"
          badge="Ingresos"
          color="default"
        />
        <KpiBox
          titulo="Costo operativo"
          valor="$270.000"
          descripcion="Produccion, staff y estructura"
          badge="Egresos"
          color="warning"
        />
        <KpiBox
          titulo="Ganancia estimada"
          valor="$730.000"
          descripcion="Resultado neto proyectado del periodo"
          badge="+21%"
          color="success"
        />
        <KpiBox
          titulo="Ocupacion promedio"
          valor="84%"
          descripcion="Asistencia real sobre capacidad total"
          badge="Estable"
          color="default"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ContenedorDatos>
          <Header
            titulo="Eventos con mejor desempeno"
            action={
              <Btn size="sm" variant="outline">
                Exportar vista
              </Btn>
            }
          />
          <div className="px-6 pt-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Rentabilidad alta
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Mayor asistencia
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Seguimiento anual
              </span>
            </div>
          </div>
          <GenericTable<FilaEvento>
            columns={["nombre", "fecha", "asistentes", "costoTotal", "totalRecaudado", "margen"]}
            data={eventos}
            actions={() => (
              <Btn size="sm" variant="outline">
                Abrir
              </Btn>
            )}
          />
        </ContenedorDatos>

        <ChartCard
          titulo="Balance por evento"
          subtitulo="Comparacion directa entre costo operativo e ingreso bruto para identificar las fechas con mejor amplitud financiera."
        >
          <GroupedBarsMock
            max={500}
            primaryColor="#F59E0B"
            secondaryColor="#2563EB"
            primaryLabel="Costos"
            secondaryLabel="Ingresos"
            data={[
              { label: "Primavera", primary: 150, secondary: 480 },
              { label: "Rock", primary: 120, secondary: 320 },
              { label: "Teatro", primary: 82, secondary: 210 },
            ]}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr_0.7fr]">
        <ChartCard
          titulo="Ocupacion por evento"
          subtitulo="La barra favorece la comparacion rapida entre fechas con capacidad similar."
        >
          <SimpleVerticalBars
            max={100}
            showValues
            colorClass="bg-gradient-to-t from-blue-600 to-sky-400"
            data={[
              { label: "Primavera", value: 91 },
              { label: "Rock", value: 83 },
              { label: "Teatro", value: 74 },
            ]}
          />
        </ChartCard>

        

        <ChartCard
          titulo="Hallazgos clave"
          subtitulo="Lectura ejecutiva para decisiones operativas y comerciales."
        >
          <InsightList
            items={[
              {
                label: "Pico de rentabilidad",
                value: "Marzo",
                helper: "El trimestre inicial concentro las mejores fechas.",
              },
              {
                label: "Mayor margen",
                value: "68%",
                helper: "Festival Primavera fue el evento mas eficiente.",
              },
              {
                label: "Riesgo detectado",
                value: "Costos fijos",
                helper: "Suben fuerte en eventos de mayor estructura tecnica.",
              },
            ]}
          />
        </ChartCard>
      </section>
    </main>
  );
};

export default InformesResumenAnual;
