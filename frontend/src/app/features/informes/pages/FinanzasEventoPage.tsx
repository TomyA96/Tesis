import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import type { Column } from "../../../ui/componentes/GenericTable/GenericTable.types";
import Header from "../../../ui/componentes/Header";
import ChartCard from "../componentes/ChartCard";
import KpiBox from "../componentes/KpiBox";
import GraficoTorta from "../componentes/GraficoTorta";
import { useInformeEvento } from "../informeEvento";
import { formatPesosEnteros } from "../../../utils/formatoPrecio";

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

// Una línea de las tablas: un movimiento cargado, o un total calculado (las ventas, las comisiones)
type Linea = {
    id: string | number;
    concepto: string;
    origen: string | null;
    descripcion: string | null;
    monto: number;
};

// Entradas y Buffet tienen el mismo color en todos los informes
const COLORES_FIJOS: Record<string, string> = { "Venta de entradas": "#0D9488", Buffet: "#7C3AED" };

// Suma los montos por concepto, para las tortas
const agrupar = (lineas: Linea[]) => {
    const porConcepto = new Map<string, number>();
    for (const l of lineas) porConcepto.set(l.concepto, (porConcepto.get(l.concepto) ?? 0) + l.monto);
    return [...porConcepto.entries()].map(([concepto, monto]) => ({ clave: concepto, nombre: concepto, valor: monto, color: COLORES_FIJOS[concepto] }));
};

/*
    Dos columnas, para que las dos tablas entren una al lado de la otra: el
    origen y la descripción van debajo del concepto. Sin fecha: en el informe
    importa cuánto fue, no cuándo se cargó.
*/
const columnas: Column<Linea>[] = [
    {
        key: "concepto",
        label: "Concepto",
        render: (_, row) => (
            <div className="min-w-0">
                <p className="font-medium text-slate-800">{row.concepto}</p>
                {(row.origen || row.descripcion) && (
                    <p className="text-xs text-slate-400">{[row.origen, row.descripcion].filter(Boolean).join(" · ")}</p>
                )}
            </div>
        ),
    },
    {
        key: "monto",
        label: "Monto",
        render: (_, row) => <span className="block whitespace-nowrap text-right font-semibold tabular-nums">{formatPesosEnteros(row.monto)}</span>,
    },
];

/*
    Pestaña Finanzas: siempre del evento completo, sin selector de jornada,
    porque los gastos, los otros ingresos y las rendiciones se cargan por
    evento. Las tablas suman exactamente lo que dicen las tarjetas: además
    de los movimientos cargados, traen las ventas y las comisiones.
*/
const FinanzasEventoPage = () => {
    const { finanzas: f } = useInformeEvento().informe;

    const ingresos: Linea[] = [
        { id: "entradas", concepto: "Venta de entradas", origen: null, descripcion: "Online, locales y puerta", monto: f.entradas },
        { id: "buffet", concepto: "Buffet", origen: null, descripcion: "Ventas del buffet", monto: f.buffet },
        ...f.ingresos.map((m) => ({ ...m, concepto: m.rubro })),
    ].filter((l) => l.monto > 0);

    const gastos: Linea[] = [
        ...f.gastosDetalle.map((m) => ({ ...m, concepto: m.rubro })),
        ...f.comisionesPorLocal.map((c) => ({
            id: `comision-${c.idPuntoVenta}`,
            concepto: "Comisiones de locales",
            origen: c.puntoVenta,
            descripcion: "Según sus rendiciones",
            monto: c.monto,
        })),
    ];

    return (
        <div className="flex flex-col gap-6">
            <section className="grid gap-4 md:grid-cols-3">
                <KpiBox
                    titulo="Ingresos"
                    valor={formatPesosEnteros(f.recaudado)}
                    descripcion={`Entradas ${formatPesosEnteros(f.entradas)} · Buffet ${formatPesosEnteros(f.buffet)} · Otros ${formatPesosEnteros(f.otrosIngresos)}`}
                />
                <KpiBox
                    titulo="Gastos"
                    color="warning"
                    valor={formatPesosEnteros(f.gastado)}
                    descripcion={`Gastos ${formatPesosEnteros(f.gastos)} · Comisiones ${formatPesosEnteros(f.comisiones)}`}
                />
                <KpiBox
                    titulo="Resultado"
                    color={f.ganancia < 0 ? "danger" : "success"}
                    valor={formatPesosEnteros(f.ganancia)}
                    badge={f.margen === null ? undefined : `Margen ${formatoPorcentaje(f.margen)}`}
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <ChartCard titulo="Ingresos" centrado>
                    <GraficoTorta formato={formatPesosEnteros} vacio="Sin ingresos registrados" partes={agrupar(ingresos)} />
                </ChartCard>
                <ChartCard titulo="Gastos" centrado>
                    <GraficoTorta formato={formatPesosEnteros} vacio="Sin gastos registrados" partes={agrupar(gastos)} />
                </ChartCard>
            </section>

            <section className="grid items-start gap-6 xl:grid-cols-2">
                <ContenedorDatos>
                    <Header titulo="Detalle de ingresos" action={<span className="text-sm font-semibold text-slate-700">Total {formatPesosEnteros(f.recaudado)}</span>} />
                    <GenericTable<Linea> columns={columnas} data={ingresos} />
                </ContenedorDatos>

                <ContenedorDatos>
                    <Header titulo="Detalle de gastos" action={<span className="text-sm font-semibold text-slate-700">Total {formatPesosEnteros(f.gastado)}</span>} />
                    <GenericTable<Linea> columns={columnas} data={gastos} />
                </ContenedorDatos>
            </section>
        </div>
    );
};

export default FinanzasEventoPage;
