import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import Btn from "../../../ui/componentes/Btn";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import ListarProductosEvento from "../componentes/ListarProductosEvento";
import { useEffect, useState } from "react";
import GastoModal from "../modales/GastoModal";
import IngresoModal from "../modales/IngresoModal";
import ModificarListaModal from "../modales/ModificarListaModal";
import { CalendarDays } from "lucide-react";
import { useParams } from "react-router-dom";
import { getEvento, type Evento } from "../../../services/eventosService";
import {
    getGastosEvento,
    getIngresosEvento,
    deleteGasto,
    deleteIngreso,
    type GastoEvento,
    type IngresoEvento,
} from "../../../services/movimientoFinancieroService";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import { getRubros, type Rubro } from "../../../services/rubrosService";
import { getProveedores, type Proveedor } from "../../../services/proveedoresService";
import { getFuentesIngreso, type FuenteIngreso } from "../../../services/fuentesIngresoService";
import { columnasGastos, columnasIngresos } from "../movimientos.columns";
import { coloresEstadoEvento } from "../../eventos/eventos.columns";
import { fechaArgentina } from "../../../utils/zonaHoraria";
import { getProductos, getProductosEvento, type Producto } from "../../../services/productosService";

// ── UN SOLO TIPO DE MODAL ──────────────────────────────────────────────────────
// En lugar de 4 estados separados, uno solo controla todos los modales.
// Mismo patrón que Usuarios.tsx y otras páginas del sistema.
type ModalAdministrar =
    | "nuevoGasto"
    | "editarGasto"
    | "eliminarGasto"
    | "nuevoIngreso"
    | "editarIngreso"
    | "eliminarIngreso"
    | "modificarLista"
    | null;

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────────
const AdministrarEventoPage = () => {
    // El id llega por la URL: /eventos/:idEvento/administracion
    const { idEvento } = useParams();
    const id = Number(idEvento);

    
    const [modalActivo, setModalActivo] = useState<ModalAdministrar>(null);
    const [evento, setEvento] = useState<Evento | null>(null);
    const [gastos, setGastos] = useState<GastoEvento[]>([]);
    const [ingresos, setIngresos] = useState<IngresoEvento[]>([]);
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [fuentes, setFuentes] = useState<FuenteIngreso[]>([]);
    // Catálogo completo (para el modal) y los que el evento tiene asignados (para la lista)
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productosEvento, setProductosEvento] = useState<Producto[]>([]);

    const [gastoSeleccionado, setGastoSeleccionado] = useState<GastoEvento | null>(null);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState<IngresoEvento | null>(null);
    const [error, setError] = useState("");

    // Separadas para poder recargar solo la tabla que cambió después de registrar
    const cargarGastos = () =>
        getGastosEvento(id)
            .then(setGastos)
            .catch(() => setError("No se pudieron cargar los gastos del evento"));

    const cargarIngresos = () =>
        getIngresosEvento(id)
            .then(setIngresos)
            .catch(() => setError("No se pudieron cargar los ingresos del evento"));

    const cargarProductosEvento = () =>
        getProductosEvento(id)
            .then(setProductosEvento)
            .catch(() => setError("No se pudieron cargar los productos del evento"));

    useEffect(() => {
        getEvento(id)
            .then(setEvento)
            .catch(() => setError("No se pudo cargar el evento"));
        cargarGastos();
        cargarIngresos();
        cargarProductosEvento();
    }, [id]);

    // Catálogos que usan los formularios de gasto e ingreso
    useEffect(() => {
        getRubros().then(setRubros).catch(() => setError("No se pudieron cargar los rubros"));
        getProveedores().then(setProveedores).catch(() => setError("No se pudieron cargar los proveedores"));
        getFuentesIngreso().then(setFuentes).catch(() => setError("No se pudieron cargar las fuentes de ingreso"));
        getProductos().then(setProductos).catch(() => setError("No se pudieron cargar los productos"));
    }, []);

    return (
        <main className="flex flex-col gap-6 p-8">

            {/* ── MODALES ─────────────────────────────────────────────────────
                Agrupados arriba, fuera del layout visual.
                Se renderizan siempre pero solo se muestran cuando isOpen es true.
            ──────────────────────────────────────────────────────────────────── */}
            {/* El mismo modal sirve para crear y editar: con registro edita, sin registro crea */}
            <GastoModal
                isOpen={modalActivo === "nuevoGasto" || modalActivo === "editarGasto"}
                closeModal={() => setModalActivo(null)}
                idEvento={id}
                rubros={rubros}
                proveedores={proveedores}
                registro={modalActivo === "editarGasto" ? gastoSeleccionado ?? undefined : undefined}
                onSaved={cargarGastos}
            />
            <IngresoModal
                isOpen={modalActivo === "nuevoIngreso" || modalActivo === "editarIngreso"}
                closeModal={() => setModalActivo(null)}
                idEvento={id}
                rubros={rubros}
                fuentes={fuentes}
                registro={modalActivo === "editarIngreso" ? ingresoSeleccionado ?? undefined : undefined}
                onSaved={cargarIngresos}
            />
            <ConfirmarAccion
                isOpen={modalActivo === "eliminarGasto"}
                title="Eliminar gasto"
                mensaje="Desea confirmar la eliminación del gasto"
                entidad={gastoSeleccionado ? `${gastoSeleccionado.rubro} - $${gastoSeleccionado.monto}` : ""}
                onConfirmar={async () => {
                    if (!gastoSeleccionado) return;
                    await deleteGasto(gastoSeleccionado.id);
                    await cargarGastos();
                    setModalActivo(null);
                }}
                onCancelar={() => setModalActivo(null)}
            />
            <ConfirmarAccion
                isOpen={modalActivo === "eliminarIngreso"}
                title="Eliminar ingreso"
                mensaje="Desea confirmar la eliminación del ingreso"
                entidad={ingresoSeleccionado ? `${ingresoSeleccionado.rubro} - $${ingresoSeleccionado.monto}` : ""}
                onConfirmar={async () => {
                    if (!ingresoSeleccionado) return;
                    await deleteIngreso(ingresoSeleccionado.id);
                    await cargarIngresos();
                    setModalActivo(null);
                }}
                onCancelar={() => setModalActivo(null)}
            />
            <ModificarListaModal
                isOpen={modalActivo === "modificarLista"}
                closeModal={() => setModalActivo(null)}
                idEvento={id}
                productos={productos}
                asignados={productosEvento}
                onSaved={cargarProductosEvento}
            />

            {/* ── HEADER DEL EVENTO ─────────────────────────────────────────── */}
            <ContenedorDatos>
                <Header
                    titulo={evento?.nombre ?? "Cargando evento..."}
                    action={
                        evento && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>{fechaArgentina(evento.fechaHoraInicio)}</span>
                                </div>
                                <Etiqueta color={coloresEstadoEvento[evento.estado]}>{evento.estado}</Etiqueta>
                            </div>
                        )
                    }
                />
                {error && <p className="px-7 pb-4 text-sm text-red-600">{error}</p>}
            </ContenedorDatos>

            {/* ── LAYOUT PRINCIPAL ────────────────────────────────────────────
                lg:flex-row: en pantallas grandes van lado a lado
                flex-col: en pantallas chicas se apilan verticalmente
            ──────────────────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── COLUMNA IZQUIERDA: GASTOS + INGRESOS ──────────────────── */}
                <div className="flex flex-col gap-6 flex-1 min-w-0">

                    {/* GASTOS */}
                    <ContenedorDatos>
                        <Header
                            titulo="Gastos"
                            action={
                                <Btn size="sm" variant="outline" onClick={() => setModalActivo("nuevoGasto")}>
                                    + Gasto
                                </Btn>
                            }
                        />
                        <GenericTable<GastoEvento>
                            columns={columnasGastos}
                            data={gastos}
                            actions={(row) => (
                                <div className="flex gap-2">
                                    <Btn variant="outline" size="sm" onClick={() => {
                                        setGastoSeleccionado(row);
                                        setModalActivo("editarGasto");
                                    }}>
                                        Modificar
                                    </Btn>
                                    <Btn variant="danger" size="sm" onClick={() => {
                                        setGastoSeleccionado(row);
                                        setModalActivo("eliminarGasto");
                                    }}>
                                        Eliminar
                                    </Btn>
                                </div>
                            )}
                        />
                    </ContenedorDatos>

                    {/* INGRESOS */}
                    <ContenedorDatos>
                        <Header
                            titulo="Ingresos"
                            action={
                                <Btn size="sm" variant="outline" onClick={() => setModalActivo("nuevoIngreso")}>
                                    + Ingreso
                                </Btn>
                            }
                        />
                        <GenericTable<IngresoEvento>
                            columns={columnasIngresos}
                            data={ingresos}
                            actions={(row) => (
                                <div className="flex gap-2">
                                    <Btn variant="outline" size="sm" onClick={() => {
                                        setIngresoSeleccionado(row);
                                        setModalActivo("editarIngreso");
                                    }}>
                                        Modificar
                                    </Btn>
                                    <Btn variant="danger" size="sm" onClick={() => {
                                        setIngresoSeleccionado(row);
                                        setModalActivo("eliminarIngreso");
                                    }}>
                                        Eliminar
                                    </Btn>
                                </div>
                            )}
                        />
                    </ContenedorDatos>

                </div>

                {/* ── COLUMNA DERECHA: PRODUCTOS ────────────────────────────── */}
                <div className="w-full lg:w-80">
                    <ContenedorDatos>
                        <Header
                            titulo="Lista de Productos"
                            action={
                                <Btn
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalActivo("modificarLista")}
                                >
                                    Modificar lista
                                </Btn>
                            }
                        />
                        <div className="p-4">
                            <ListarProductosEvento items={productosEvento} />
                        </div>
                    </ContenedorDatos>
                </div>

            </div>
        </main>
    );
};

export default AdministrarEventoPage;
