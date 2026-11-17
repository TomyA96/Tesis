import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Header from "../../../ui/componentes/Header";
import DropdownAnio from "../../../ui/componentes/DropdownAnio";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import ChartCard from "../componentes/ChartCard";
import KpiBox from "../componentes/KpiBox";
import BarraComposicion from "../componentes/BarraComposicion";
import BarrasResultado from "../componentes/BarrasResultado";
import OcupacionDesplegable from "../componentes/OcupacionDesplegable";
import { columnasResumenAnual } from "../informes.columns";
import { RUTAS } from "../../../constantes/Rutas";
import { formatPesosEnteros } from "../../../utils/formatoPrecio";
import { getAniosConEventos, getResumenAnual, type ResumenAnual } from "../../../services/informesService";

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

/*
    Página de inicio de Informes: el resumen de todos los eventos publicados
    del año elegido. Desde la tabla del final se entra al informe de cada
    evento. Todos los números los calcula el backend (InformesService).
*/
const InformesHomePage = () => {
    // null mientras se cargan; [] si todavía no hay ningún evento publicado
    const [anios, setAnios] = useState<number[] | null>(null);
    const [anio, setAnio] = useState<number | null>(null);
    const [resumen, setResumen] = useState<ResumenAnual | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getAniosConEventos()
            .then((lista) => {
                setAnios(lista);
                // Arranca en el año actual si tiene eventos; si no, en el más reciente
                const actual = new Date().getFullYear();
                setAnio(lista.includes(actual) ? actual : (lista[0] ?? null));
            })
            .catch((e: Error) => setError(e.message));
    }, []);

    useEffect(() => {
        if (anio === null) return;
        // Si se cambia de año antes de que llegue la respuesta anterior, esa se descarta
        let vigente = true;
        setResumen(null);
        setError("");
        getResumenAnual(anio)
            .then((datos) => vigente && setResumen(datos))
            .catch((e: Error) => vigente && setError(e.message));
        return () => {
            vigente = false;
        };
    }, [anio]);

    const encabezado = (
        <EncabezadoPagina
            icono={<BarChart2 />}
            seccion="Informes"
            titulo="Resumen anual"
            acciones={anios && anio !== null && <DropdownAnio años={anios} value={anio} onChange={setAnio} />}
        />
    );

    const aviso = (texto: string, esError = false) => (
        <main className="flex flex-col gap-6 px-6 pb-8">
            {encabezado}
            <p className={esError ? "rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700" : "py-12 text-center text-sm text-gray-400"}>
                {texto}
            </p>
        </main>
    );

    if (error) return aviso(`No se pudo cargar el resumen: ${error}`, true);
    if (anios && anios.length === 0) return aviso("Todavía no hay eventos publicados para mostrar.");
    if (!resumen) return aviso("Cargando…");

    const { totales, eventos } = resumen;
    const { pendienteRendir } = totales;

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            {encabezado}

            {/* ── TOTALES DEL AÑO ─────────────────────────────────────────── */}
            <section className="grid gap-4 md:grid-cols-3">
                <KpiBox
                    titulo="Recaudado"
                    valor={formatPesosEnteros(totales.recaudado)}
                    descripcion={
                        <>
                            {/* De dónde vino la plata del año: una sola barra, no un gráfico por evento */}
                            <BarraComposicion
                                formato={formatPesosEnteros}
                                partes={[
                                    { nombre: "Entradas", valor: totales.entradas, color: "#0D9488" },
                                    { nombre: "Buffet", valor: totales.buffet, color: "#7C3AED" },
                                    { nombre: "Otros ingresos", valor: totales.otrosIngresos, color: "#D97706" },
                                ]}
                            />
                            {/* No suma al recaudado: los locales todavía pueden devolver tickets sin vender */}
                            {pendienteRendir.tickets > 0 && (
                                <p className="mt-3 text-xs text-slate-400">
                                    Pendiente de rendir: {pendienteRendir.tickets} tickets en locales (hasta{" "}
                                    {formatPesosEnteros(pendienteRendir.monto)})
                                </p>
                            )}
                        </>
                    }
                />
                <KpiBox
                    titulo="Gastado"
                    color="warning"
                    valor={formatPesosEnteros(totales.gastado)}
                    descripcion={`Gastos ${formatPesosEnteros(totales.gastos)} · Comisiones ${formatPesosEnteros(totales.comisiones)}`}
                />
                <KpiBox
                    titulo="Ganancia"
                    color={totales.ganancia < 0 ? "danger" : "success"}
                    valor={formatPesosEnteros(totales.ganancia)}
                    badge={totales.margen === null ? undefined : `Margen ${formatoPorcentaje(totales.margen)}`}
                />
            </section>

            {/* ── GRÁFICOS POR EVENTO ─────────────────────────────────────── */}
            {/* Los dos muestran como mucho 5 filas: con muchos eventos no crecen, el detalle está en la tabla */}
            <section className="grid gap-6 xl:grid-cols-2">
                <ChartCard titulo="Resultado por evento">
                    <BarrasResultado formato={formatPesosEnteros} eventos={eventos} />
                </ChartCard>

                <ChartCard titulo="Ocupación">
                    <OcupacionDesplegable eventos={eventos} />
                </ChartCard>
            </section>

            {/* ── TABLA: entrada a los informes de cada evento ────────────── */}
            <ContenedorDatos>
                <Header titulo={`Eventos de ${resumen.anio}`} />
                <GenericTable
                    columns={columnasResumenAnual}
                    data={eventos}
                    actions={(row) => (
                        <LinkBtn to={RUTAS.informes.general(row.id)} variant="outline" size="sm" className="whitespace-nowrap">
                            Ver informe
                        </LinkBtn>
                    )}
                />
            </ContenedorDatos>
        </main>
    );
};

export default InformesHomePage;
