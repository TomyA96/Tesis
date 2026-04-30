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
import TabsInforme from "../componentes/TabsInforme";

type MovimientoFinanciero = {
  concepto: string;
  categoria: string;
  monto: string;
  participacion: string;
};

const FinanzasEvento = () => {
  const ingresos: MovimientoFinanciero[] = [
    { concepto: "Venta de entradas", categoria: "Comercial", monto: "$11.240.000", participacion: "62%" },
    { concepto: "Venta buffet", categoria: "Operacion", monto: "$1.060.000", participacion: "6%" },
    { concepto: "Sponsors", categoria: "Alianzas", monto: "$4.500.000", participacion: "25%" },
    { concepto: "Merchandising", categoria: "Complementario", monto: "$820.000", participacion: "5%" },
    { concepto: "Acreditaciones premium", categoria: "Hospitality", monto: "$430.000", participacion: "2%" },
  ];

  const gastos: MovimientoFinanciero[] = [
    { concepto: "Publicidad", categoria: "Marketing", monto: "$1.480.000", participacion: "13%" },
    { concepto: "Artistas", categoria: "Produccion", monto: "$4.900.000", participacion: "44%" },
    { concepto: "Sonido y escenario", categoria: "Tecnica", monto: "$2.150.000", participacion: "19%" },
    { concepto: "Materia prima buffet", categoria: "Operacion", monto: "$420.000", participacion: "4%" },
    { concepto: "Seguridad y staff", categoria: "Personal", monto: "$1.260.000", participacion: "11%" },
    { concepto: "Logistica general", categoria: "Infraestructura", monto: "$980.000", participacion: "9%" },
  ];

  return (
    <main className="grid grid-cols-1 gap-6 px-6 pb-8 xl:grid-cols-[290px_1fr]">
      <aside className="flex flex-col gap-6">
        <ContenedorDatos>
          <Header titulo="Contexto financiero" />
          <div className="p-5">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ano del evento
            </label>
            <select className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none">
              <option>2025</option>
            </select>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Enfoque del reporte
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Resultado economico integral del evento</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Vista pensada para analizar origen del ingreso, estructura de costos y resultado final.
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
            { id: "buffet", label: "Buffet" },
            { id: "finanzas", label: "Finanzas" },
          ]}
          activeTab="finanzas"
        />

        <ContenedorDatos className="overflow-visible">
          <Header
            titulo="Resumen financiero del evento"
            action={
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Balance positivo
              </span>
            }
          />
          <div className="grid gap-6 p-6 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Lectura ejecutiva
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                El evento cierra con margen positivo sostenido por entradas y sponsors.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Esta vista integra todas las fuentes de ingreso y costo para ofrecer una lectura clara
                del resultado final y detectar donde se concentra la mayor sensibilidad financiera.
              </p>
              <div className="mt-6">
                <InfoPairs
                  items={[
                    { label: "Evento", value: "Fiesta de la Tradicion" },
                    { label: "Fecha", value: "25/05/2025" },
                    { label: "Capacidad", value: "2.000 personas" },
                    { label: "Modalidad", value: "Presencial con buffet y sponsors" },
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <KpiBox
                titulo="Total de ingresos"
                valor="$18.050.000"
                descripcion="Consolidado de todas las fuentes del evento"
                badge="Bruto"
                color="default"
              />
              <KpiBox
                titulo="Total de gastos"
                valor="$11.190.000"
                descripcion="Operacion, tecnica, marketing y estructura"
                badge="Egresos"
                color="warning"
              />
              <KpiBox
                titulo="Resultado final"
                valor="+$6.860.000"
                descripcion="Ganancia neta estimada al cierre del evento"
                badge="Positivo"
                color="success"
              />
            </div>
          </div>
        </ContenedorDatos>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ContenedorDatos>
            <Header
              titulo="Desglose de ingresos"
              action={
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Fuentes
                </span>
              }
            />
            <GenericTable<MovimientoFinanciero>
              columns={["concepto", "categoria", "monto", "participacion"]}
              data={ingresos}
            />
          </ContenedorDatos>

          <ContenedorDatos>
            <Header
              titulo="Desglose de gastos"
              action={
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Costos
                </span>
              }
            />
            <GenericTable<MovimientoFinanciero>
              columns={["concepto", "categoria", "monto", "participacion"]}
              data={gastos}
            />
          </ContenedorDatos>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr_0.85fr]">
          <ChartCard
            titulo="Fuentes de ingreso"
            subtitulo="En un entorno financiero la comparacion directa entre fuentes es mas clara como ranking que como torta."
          >
            <SimpleHorizontalBars
              max={70}
              valueSuffix="%"
              colorClass="bg-blue-600"
              data={[
                { label: "Venta de entradas", value: 62, helper: "$11.240.000 - motor principal de facturacion" },
                { label: "Sponsors", value: 25, helper: "$4.500.000 - aporte clave al margen" },
                { label: "Venta buffet", value: 6, helper: "$1.060.000 - ingreso operativo complementario" },
                { label: "Merchandising", value: 5, helper: "$820.000 - linea comercial secundaria" },
                { label: "Acreditaciones premium", value: 2, helper: "$430.000 - hospitalidad" },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Estructura de gastos"
            subtitulo="Los rubros de costo se comparan mejor en orden de peso relativo."
          >
            <SimpleHorizontalBars
              max={50}
              valueSuffix="%"
              colorClass="bg-amber-500"
              data={[
                { label: "Artistas", value: 44, helper: "$4.900.000 - mayor incidencia presupuestaria" },
                { label: "Sonido y escenario", value: 19, helper: "$2.150.000 - bloque tecnico principal" },
                { label: "Publicidad", value: 13, helper: "$1.480.000 - adquisicion y posicionamiento" },
                { label: "Seguridad y staff", value: 11, helper: "$1.260.000 - operacion de campo" },
                { label: "Logistica general", value: 9, helper: "$980.000 - montaje y soporte" },
                { label: "Materia prima buffet", value: 4, helper: "$420.000 - abastecimiento gastronomico" },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Hallazgos financieros"
            subtitulo="Resumen para toma de decisiones sobre presupuesto y escalabilidad."
          >
            <InsightList
              items={[
                { label: "Mayor aporte", value: "Entradas", helper: "Concentran casi dos tercios del ingreso total" },
                { label: "Costo critico", value: "Artistas", helper: "Es el rubro con mas sensibilidad del balance" },
                { label: "Resultado", value: "Positivo", helper: "El sponsorship mejora significativamente el margen" },
              ]}
            />
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ChartCard
            titulo="Comparativa ingresos vs gastos"
            subtitulo="La comparacion agrupada permite ver con claridad la amplitud financiera entre ambos bloques."
          >
            <GroupedBarsMock
              max={19}
              primaryColor="#2563EB"
              secondaryColor="#F59E0B"
              primaryLabel="Ingresos (millones)"
              secondaryLabel="Gastos (millones)"
              data={[
                { label: "Totales", primary: 18.05, secondary: 11.19 },
                { label: "Operacion", primary: 1.49, secondary: 0.42 },
                { label: "Comercial", primary: 11.24, secondary: 1.48 },
                { label: "Produccion", primary: 5.32, secondary: 9.29 },
              ]}
            />
          </ChartCard>

          <ChartCard
            titulo="Sensibilidad del balance"
            subtitulo="Indicadores para saber que partes del negocio merecen mayor seguimiento."
          >
            <InsightList
              items={[
                { label: "Margen neto", value: "38%", helper: "Sobre ingresos totales del evento" },
                { label: "Dependencia sponsors", value: "25%", helper: "Aporte fuerte al cierre positivo" },
                { label: "Peso tecnico", value: "19%", helper: "Escenario y sonido dentro del gasto total" },
                { label: "Ingreso complementario", value: "13%", helper: "Buffet, merchandising y premium combinados" },
              ]}
            />
          </ChartCard>
        </section>
      </section>
    </main>
  );
};

export default FinanzasEvento;
