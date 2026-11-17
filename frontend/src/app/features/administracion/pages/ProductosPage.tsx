import Btn from "../../../ui/componentes/Btn";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import { PencilLine } from "lucide-react";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import CrearProductoModal from "../modales/CrearProductoModal";
import EditarProductoModal from "../modales/EditarProductoModal";
import FiltroProductos, {
    aplicarFiltrosProductos,
   
    type FiltrosProductos,
} from "../componentes/FiltroProductos";
import { columnasProductos } from "../productos.columns";
import { useState, useEffect, useMemo } from "react";
import { getProductos, deleteProducto, type Producto } from "../../../services/productosService";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type ModalProductos = "crearProducto" | "editarProducto" | "eliminarProducto" | null;

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const ProductosPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [activarModal, setActivarModal] = useState<ModalProductos>(null);
    const [filtros, setFiltros] = useState<FiltrosProductos>({ texto: "", tipo: "", estado: "Disponible" });
    const [error, setError] = useState("");

    const cargarProductos = () => {
        return getProductos()
            .then((response) => {
                setProductos(response);
                setError("");
            })
            .catch(() => setError("No se pudieron cargar los productos"));
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    /*
        Una sola tabla con filtro por tipo en vez de dos tablas separadas: si más
        adelante se suma otro tipo de producto (merchandising, por ejemplo),
        alcanza con agregarlo al enum y aparece solo en el filtro.
    */
    const productosFiltrados = useMemo(
        () => aplicarFiltrosProductos(productos, filtros),
        [productos, filtros],
    );

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                icono={<PencilLine />}
                seccion="Administración"
                titulo="Productos"
                acciones={<Btn onClick={() => setActivarModal("crearProducto")}>+ Agregar Producto</Btn>}
            />
            <ContenedorDatos>

                {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}

                <div className="px-6 pt-4">
                    <FiltroProductos filtros={filtros} onChange={setFiltros} />
                </div>

                <GenericTable<Producto>
                    columns={columnasProductos}
                    data={productosFiltrados}
                    actions={(row) => (
                        <div className="grid grid-cols-2 gap-2">
                            <Btn
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setProductoSeleccionado(row);
                                    setActivarModal("editarProducto");
                                }}
                            >
                                Editar
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                    setProductoSeleccionado(row);
                                    setActivarModal("eliminarProducto");
                                }}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>

            {/* ── MODALES ──────────────────────────────────────────────────── */}

            <CrearProductoModal
                isOpen={activarModal === "crearProducto"}
                closeModal={() => setActivarModal(null)}
                onCreated={() => {
                    cargarProductos();
                    setActivarModal(null);
                }}
            />

            <EditarProductoModal
                isOpen={activarModal === "editarProducto"}
                producto={productoSeleccionado}
                closeModal={() => setActivarModal(null)}
                onUpdated={() => {
                    cargarProductos();
                    setActivarModal(null);
                }}
            />

            <ConfirmarAccion
                isOpen={activarModal === "eliminarProducto"}
                title="Eliminar producto"
                mensaje="Desea confirmar la eliminación del producto"
                entidad={productoSeleccionado?.nombre || ""}
                onConfirmar={async () => {
                    if (!productoSeleccionado) return;
                    await deleteProducto(productoSeleccionado.id);
                    await cargarProductos();
                    setActivarModal(null);
                }}
                onCancelar={() => setActivarModal(null)}
            />
        </main>
    );
};

export default ProductosPage;
