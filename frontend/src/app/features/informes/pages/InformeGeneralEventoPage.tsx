import ChartCard from "../componentes/ChartCard";
import KpiBox from "../componentes/KpiBox";
import BarraComposicion from "../componentes/BarraComposicion";
import BarrasApiladas from "../componentes/BarrasApiladas";
import BarrasOcupacion from "../componentes/BarrasOcupacion";
import { nombreDeJornada, useInformeEvento } from "../informeEvento";
import { formatPesosEnteros } from "../../../utils/formatoPrecio";

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

/*
    Pestaña General: el evento completo en cuatro números, cuánto dejó cada
    persona que vino y, si tuvo más de una jornada, cómo le fue a cada una
    (ocupación y recaudación).
*/
const InformeGeneralEventoPage = () => {
    const { informe } = useInformeEvento();
    const { finanzas, jornadas } = informe;

    // Ocupación solo de las jornadas que ya se hicieron (una futura daría 0%)
    const realizadas = jornadas.filter((j) => j.realizada);
    const asistentes = realizadas.reduce((suma, j) => suma + j.entradas.asistentes, 0);
    const capacidad = realizadas.reduce((suma, j) => suma + j.capacidad, 0);
    const ocupacion = capacidad === 0 ? null : (asistentes / capacidad) * 100;

    /*
        De los que compraron entrada para una jornada que ya pasó, cuántos
        fueron. Se calcula con las vendidas (no con los asistentes, que pueden
        incluir tickets que entraron sin venta registrada).
    */
    const vendidasRealizadas = realizadas.reduce((suma, j) => suma + j.entradas.vendidas, 0);
    const vendidasUsadas = realizadas.reduce((suma, j) => suma + j.entradas.vendidas - j.entradas.vendidasSinUsar, 0);
    const porPersona = (monto: number) => (asistentes === 0 ? "—" : formatPesosEnteros(monto / asistentes));
    /*
        Gasto promedio: lo que gastó cada persona que vino (entrada + buffet).
        No usa todo lo recaudado: los otros ingresos (un sponsor, por ejemplo)
        no salen del bolsillo de los asistentes.
        Promedio de asistencia: de las entradas vendidas para jornadas que ya
        pasaron, cuántas se usaron.
    */
    const indicadores = [
        { titulo: "Gasto promedio", valor: porPersona(finanzas.entradas + finanzas.buffet) },
        { titulo: "Gasto en buffet", valor: porPersona(finanzas.buffet) },
        {
            titulo: "Promedio de asistencia",
            valor: vendidasRealizadas === 0 ? "—" : formatoPorcentaje((vendidasUsadas / vendidasRealizadas) * 100),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiBox
                    titulo="Recaudado"
                    valor={formatPesosEnteros(finanzas.recaudado)}
                    descripcion={
                        <BarraComposicion
                            formato={formatPesosEnteros}
                            partes={[
                                { nombre: "Entradas", valor: finanzas.entradas, color: "#0D9488" },
                                { nombre: "Buffet", valor: finanzas.buffet, color: "#7C3AED" },
                                { nombre: "Otros ingresos", valor: finanzas.otrosIngresos, color: "#D97706" },
                            ]}
                        />
                    }
                />
                <KpiBox
                    titulo="Gastado"
                    color="warning"
                    valor={formatPesosEnteros(finanzas.gastado)}
                    descripcion={`Gastos ${formatPesosEnteros(finanzas.gastos)} · Comisiones ${formatPesosEnteros(finanzas.comisiones)}`}
                />
                <KpiBox
                    titulo="Ganancia"
                    color={finanzas.ganancia < 0 ? "danger" : "success"}
                    valor={formatPesosEnteros(finanzas.ganancia)}
                    badge={finanzas.margen === null ? undefined : `Margen ${formatoPorcentaje(finanzas.margen)}`}
                />
                <KpiBox
                    titulo="Asistencia"
                    valor={asistentes.toLocaleString("es-AR")}
                    badge={ocupacion === null ? undefined : `Ocupación ${formatoPorcentaje(ocupacion)}`}
                />
            </section>

            <ChartCard titulo="Indicadores por persona">
                <div className="grid gap-3 sm:grid-cols-3">
                    {indicadores.map((i) => (
                        <div key={i.titulo} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{i.titulo}</p>
                            <p className="mt-2 text-xl font-bold tabular-nums text-slate-900">{i.valor}</p>
                        </div>
                    ))}
                </div>
            </ChartCard>

            {/* Con una sola jornada no hay nada que comparar */}
            {jornadas.length > 1 && (
                <section className="grid gap-6 xl:grid-cols-2">
                    <ChartCard titulo="Ocupación por jornada">
                        <BarrasOcupacion
                            data={jornadas.map((j) => ({
                                clave: j.id,
                                label: nombreDeJornada(j),
                                porcentaje: j.realizada && j.capacidad > 0 ? (j.entradas.asistentes / j.capacidad) * 100 : null,
                                detalle: `${j.entradas.asistentes} / ${j.capacidad}`,
                            }))}
                        />
                    </ChartCard>
                    <ChartCard titulo="Recaudación por jornada">
                        <BarrasApiladas
                            formato={formatPesosEnteros}
                            series={[
                                { nombre: "Entradas", color: "#0D9488" },
                                { nombre: "Buffet", color: "#7C3AED" },
                            ]}
                            data={jornadas.map((j) => ({
                                clave: j.id,
                                label: nombreDeJornada(j),
                                valores: [j.entradas.recaudado, j.buffet.total],
                            }))}
                        />
                    </ChartCard>
                </section>
            )}
        </div>
    );
};

export default InformeGeneralEventoPage;
