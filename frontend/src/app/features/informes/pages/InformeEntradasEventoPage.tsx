import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import type { Column } from "../../../ui/componentes/GenericTable/GenericTable.types";
import Header from "../../../ui/componentes/Header";
import ChartCard from "../componentes/ChartCard";
import KpiBox from "../componentes/KpiBox";
import GraficoAnillo from "../componentes/GraficoAnillo";
import BarrasRanking from "../componentes/BarrasRanking";
import SelectorJornada from "../componentes/SelectorJornada";
import { combinarEntradas, jornadasElegidas, useInformeEvento } from "../informeEvento";
import { formatPesosEnteros, formatPrecioEntrada } from "../../../utils/formatoPrecio";

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
const cantidad = (valor: number) => valor.toLocaleString("es-AR");

type FilaLote = ReturnType<typeof combinarEntradas>["lotes"][number];

/*
    Pestaña Entradas: cuánto se emitió, se vendió y cuánta gente entró, por
    qué canal se vendió y qué lote salió más. El selector de arriba filtra
    todo a una jornada.
*/
const InformeEntradasEventoPage = () => {
    const { informe, idJornada } = useInformeEvento();
    const e = combinarEntradas(jornadasElegidas(informe, idJornada));
    // Con varias jornadas a la vista, cada lote necesita decir de cuál es
    const variasJornadas = idJornada === null && informe.jornadas.length > 1;

    const libres = Math.max(e.capacidad - e.asistentes - e.vendidasSinUsar, 0);
    const ocupacion = e.capacidad === 0 ? 0 : (e.asistentes / e.capacidad) * 100;

    const columnas: Column<FilaLote>[] = [
        { key: "descripcion", label: "Lote" },
        ...(variasJornadas ? [{ key: "jornada" as const, label: "Jornada" }] : []),
        { key: "esFisica", label: "Tipo", render: (_, row) => (row.esBoleteria ? "Boletería" : row.esFisica ? "Física" : "Online") },
        { key: "precio", label: "Precio", render: (_, row) => formatPrecioEntrada(row.precio) },
        { key: "emitidas", label: "Emitidas" },
        { key: "vendidas", label: "Vendidas" },
        { key: "recaudado", label: "Recaudado", render: (_, row) => formatPesosEnteros(row.recaudado) },
    ];

    return (
        <div className="flex flex-col gap-6">
            <SelectorJornada />

            {/* Las tarjetas, una debajo de la otra, al lado de la ocupación: cuentan lo mismo que el anillo */}
            <section className="grid gap-6 xl:grid-cols-[minmax(0,20rem)_1fr]">
                <div className="flex flex-col gap-4">
                    <KpiBox
                        titulo="Entradas emitidas"
                        valor={cantidad(e.emitidas)}
                        descripcion={`${cantidad(e.vendidas)} vendidas · ${formatPesosEnteros(e.recaudado)}`}
                    />
                    <KpiBox
                        titulo="Ingresaron"
                        color="success"
                        valor={cantidad(e.asistentes)}
                        badge={e.capacidad === 0 ? undefined : formatoPorcentaje(ocupacion)}
                        descripcion={`De ${cantidad(e.capacidad)} lugares`}
                    />
                    <KpiBox
                        titulo="Vendidas sin usar"
                        color="warning"
                        valor={cantidad(e.vendidasSinUsar)}
                    />
                </div>

                <ChartCard titulo="Ocupación" centrado>
                    <GraficoAnillo
                        maximo="20rem"
                        centroLabel="Ocupación"
                        centroValor={formatoPorcentaje(ocupacion)}
                        partes={[
                            { nombre: "Ingresaron", valor: e.asistentes, color: "#2563EB" },
                            { nombre: "Vendidas sin usar", valor: e.vendidasSinUsar, color: "#D97706" },
                            { nombre: "Lugares libres", valor: libres, color: "#E2E8F0" },
                        ]}
                    />
                </ChartCard>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <ChartCard titulo="Canales de venta">
                    <BarrasRanking
                        formato={(v) => `${cantidad(v)} vendidas`}
                        vacio="Todavía no se vendieron entradas"
                        data={e.canales.map((c) => ({ clave: c.canal, label: c.canal, valor: c.cantidad, detalle: formatPesosEnteros(c.monto) }))}
                    />
                    {/* Lo que tienen los locales sin rendir no está en ningún canal todavía */}
                    {e.pendienteRendir.tickets > 0 && (
                        <p className="mt-4 text-xs text-slate-400">
                            Pendiente de rendir: {cantidad(e.pendienteRendir.tickets)} tickets en locales (hasta {formatPesosEnteros(e.pendienteRendir.monto)})
                        </p>
                    )}
                </ChartCard>

                <ChartCard titulo="Mix por lote">
                    <BarrasRanking
                        formato={(v) => `${cantidad(v)} vendidas`}
                        data={e.lotes.map((l) => ({
                            clave: l.id,
                            label: l.descripcion,
                            valor: l.vendidas,
                            // La jornada va en la línea de detalle: junto al nombre no entraba y se cortaba
                            detalle: `${variasJornadas ? `${l.jornada} · ` : ""}${cantidad(l.vendidas)} de ${cantidad(l.emitidas)} (${formatoPorcentaje(l.emitidas === 0 ? 0 : (l.vendidas / l.emitidas) * 100)})`,
                        }))}
                    />
                </ChartCard>
            </section>

            <ContenedorDatos>
                <Header titulo="Detalle por tipo de entrada" />
                <GenericTable<FilaLote> columns={columnas} data={e.lotes} />
            </ContenedorDatos>
        </div>
    );
};

export default InformeEntradasEventoPage;
