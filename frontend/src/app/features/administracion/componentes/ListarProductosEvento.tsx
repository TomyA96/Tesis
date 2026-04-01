import { formatPrecio } from "../../../utils/formatoPrecio";

// ── TIPOS ──────────────────────────────────────────────────────────────────────
type Categoria = "comida" | "bebida";

type ProductosProps = {
    id:        string;
    nombre:    string;
    categoria: Categoria;
    precio:    number;
};

type ListaProductosProps = {
    items: ProductosProps[];
};

// ── COMPONENTE INTERNO: LISTA POR CATEGORÍA ────────────────────────────────────
// Extraemos la lista en su propio componente para no repetir
// el mismo bloque de JSX para Comidas y Bebidas
type ListaCategoriaProps = {
    titulo: string;
    items:  ProductosProps[];
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
                        {/* Nombre del producto */}
                        <span className="flex-1 text-sm text-gray-700 truncate">
                            {item.nombre}
                        </span>

                        {/*
                            Línea punteada conectora — une visualmente el nombre con el precio
                            flex-1 min-w-[1rem]: ocupa el espacio disponible entre nombre y precio
                            border-b border-dashed: la línea de puntos
                        */}
                        <span className="flex-1  border-b border-dashed border-gray-200 mb-1" />

                        {/* Precio */}
                        <span className="text-sm font-medium text-gray-800 tabular-nums whitespace-nowrap">
                            {formatPrecio(item.precio)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
const ListarProductosEvento = ({ items }: ListaProductosProps) => {
    const comidas = items.filter((p) => p.categoria === "comida");
    const bebidas = items.filter((p) => p.categoria === "bebida");

    return (
        <div className="flex flex-col gap-4">

            {/* ── ESTADO VACÍO ──────────────────────────────────────────────── */}
            {/* Mismo patrón que GenericTable — ícono + texto gris centrado */}
            {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                    </svg>
                    <p className="text-sm">No hay productos asignados</p>
                </div>
            )}

            {/* ── LISTAS POR CATEGORÍA ──────────────────────────────────────── */}
            {/*
                Usamos el componente ListaCategoria que retorna null si no hay items
                así no necesitamos el condicional {comidas.length > 0 && ...}
                afuera — el componente se encarga solo
            */}
            <ListaCategoria titulo="Comidas" items={comidas} />
            <ListaCategoria titulo="Bebidas" items={bebidas} />

        </div>
    );
};

export default ListarProductosEvento;