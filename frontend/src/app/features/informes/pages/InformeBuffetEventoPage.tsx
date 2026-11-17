import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import type { Column } from "../../../ui/componentes/GenericTable/GenericTable.types";
import Header from "../../../ui/componentes/Header";
import ChartCard from "../componentes/ChartCard";
import KpiBox from "../componentes/KpiBox";
import GraficoTorta from "../componentes/GraficoTorta";
import BarrasRanking from "../componentes/BarrasRanking";
import ColumnasApiladas from "../componentes/ColumnasApiladas";
import SelectorJornada from "../componentes/SelectorJornada";
import { combinarBuffet, jornadasElegidas, useInformeEvento } from "../informeEvento";
import { formatPesosEnteros } from "../../../utils/formatoPrecio";

const COLOR_COMIDA = "#D97706";
const COLOR_BEBIDA = "#2563EB";
// Cuántos productos entran en cada top; la lista completa está en las tablas de abajo
const TOP = 5;

const formatoPorcentaje = (valor: number) => `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;

type FilaProducto = ReturnType<typeof combinarBuffet>["comidas"][number];

/*
    Pestaña Buffet: cuánto se vendió, en qué se repartió entre comida y
    bebida, a qué hora se vendió más y qué productos salieron más. El
    selector de arriba filtra todo a una jornada.
*/
const InformeBuffetEventoPage = () => {
    const { informe, idJornada } = useInformeEvento();
    const b = combinarBuffet(jornadasElegidas(informe, idJornada));

    const totalComidas = b.comidas.reduce((suma, p) => suma + p.total, 0);
    const totalBebidas = b.bebidas.reduce((suma, p) => suma + p.total, 0);

    const columnas: Column<FilaProducto>[] = [
        { key: "nombre", label: "Producto" },
        { key: "cantidad", label: "Unidades" },
        { key: "total", label: "Total", render: (_, row) => formatPesosEnteros(row.total) },
        { key: "id", label: "% del buffet", render: (_, row) => formatoPorcentaje(b.total === 0 ? 0 : (row.total / b.total) * 100) },
    ];
    const ranking = (productos: FilaProducto[]) =>
        productos.slice(0, TOP).map((p) => ({ clave: p.id, label: p.nombre, valor: p.total, detalle: `${p.cantidad.toLocaleString("es-AR")} unidades` }));

    return (
        <div className="flex flex-col gap-6">
            <SelectorJornada />

            <section className="grid gap-4 md:grid-cols-3">
                <KpiBox titulo="Ingresos del buffet" valor={formatPesosEnteros(b.total)} />
                <KpiBox titulo="Ventas" valor={b.ventas.toLocaleString("es-AR")} descripcion="Cantidad de cobros en el buffet" />
                <KpiBox
                    titulo="Ticket promedio"
                    valor={b.ventas === 0 ? "—" : formatPesosEnteros(b.total / b.ventas)}
                    descripcion="Lo que gastó en promedio cada compra"
                />
            </section>

            {b.ventas === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">No hay ventas de buffet registradas.</p>
            ) : (
                <>
                    <section className="grid gap-6 xl:grid-cols-2">
                        <ChartCard titulo="Top comidas">
                            <BarrasRanking formato={formatPesosEnteros} color={COLOR_COMIDA} vacio="No se vendieron comidas" data={ranking(b.comidas)} />
                        </ChartCard>
                        <ChartCard titulo="Top bebidas">
                            <BarrasRanking formato={formatPesosEnteros} color={COLOR_BEBIDA} vacio="No se vendieron bebidas" data={ranking(b.bebidas)} />
                        </ChartCard>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <ChartCard titulo="Comidas vs bebidas" centrado>
                            <GraficoTorta
                                maximo="15rem"
                                formato={formatPesosEnteros}
                                partes={[
                                    { clave: "comidas", nombre: "Comidas", valor: totalComidas, color: COLOR_COMIDA },
                                    { clave: "bebidas", nombre: "Bebidas", valor: totalBebidas, color: COLOR_BEBIDA },
                                ]}
                            />
                        </ChartCard>
                        <ChartCard titulo="Ventas por franja horaria">
                            <ColumnasApiladas
                                formato={formatPesosEnteros}
                                series={[
                                    { nombre: "Comidas", color: COLOR_COMIDA },
                                    { nombre: "Bebidas", color: COLOR_BEBIDA },
                                ]}
                                data={b.porHora.map((f) => ({ clave: f.hora, label: `${f.hora} h`, valores: [f.comida, f.bebida] }))}
                            />
                        </ChartCard>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <ContenedorDatos>
                            <Header titulo="Detalle de comidas" />
                            <GenericTable<FilaProducto> columns={columnas} data={b.comidas} />
                        </ContenedorDatos>
                        <ContenedorDatos>
                            <Header titulo="Detalle de bebidas" />
                            <GenericTable<FilaProducto> columns={columnas} data={b.bebidas} />
                        </ContenedorDatos>
                    </section>
                </>
            )}
        </div>
    );
};

export default InformeBuffetEventoPage;
