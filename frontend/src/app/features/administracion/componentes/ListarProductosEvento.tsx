import { formatPrecio } from "../../../utils/formatoPrecio";
import type { Producto } from "../../../services/productosService";

type ListaProductosProps = {
    items: Producto[];
};

// ── COMPONENTE INTERNO: LISTA POR CATEGORÍA ────────────────────────────────────
// Extraemos la lista en su propio componente para no repetir
// el mismo bloque de JSX para Comidas y Bebidas
type ListaCategoriaProps = {
    titulo: string;
    items:  Producto[];
};

const ListaCategoria = ({ titulo, items }: ListaCategoriaProps) => {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            {/* h3 — es un subtítulo dentro de un componente, no un título de página */}
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                {titulo}
            </h3>

            <ul className="flex flex-col gap-1">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-sm text-gray-700 truncate">
                            {item.nombre}
                        </span>

                        {/* Línea punteada que une visualmente el nombre con el precio */}
                        <span className="flex-1 min-w-4 border-b border-dashed border-gray-200 mb-1" />

                        {/* El precio llega como string (Decimal de Prisma) — Number() antes de formatear */}
                        <span className="text-sm font-medium text-gray-800 tabular-nums whitespace-nowrap">
                            {formatPrecio(Number(item.precio))}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
const ListarProductosEvento = ({ items }: ListaProductosProps) => {
    // Mismo mensaje y estilo que el estado vacío de GenericTable
    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-center text-gray-400 text-sm">
                No hay productos designados para el evento
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <ListaCategoria titulo="Comidas" items={items.filter((p) => p.tipo === "Comida")} />
            <ListaCategoria titulo="Bebidas" items={items.filter((p) => p.tipo === "Bebida")} />
        </div>
    );
};

export default ListarProductosEvento;
