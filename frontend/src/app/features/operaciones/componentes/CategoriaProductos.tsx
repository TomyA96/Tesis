import ProductoVentaCard from "./ProductoVentaCard";
import type { Producto } from "../../../services/productosService";

type CategoriaProductosProps = {
  titulo: string;
  productos: Producto[];
  cantidades: Record<number, number>;
  onCambiarCantidad: (producto: Producto, cambio: number) => void;
};

// Un grupo del catálogo (Comidas o Bebidas). Si no tiene productos no se muestra.
const CategoriaProductos = ({ titulo, productos, cantidades, onCambiarCantidad }: CategoriaProductosProps) => {
  if (productos.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{titulo}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {productos.map((producto) => (
          <ProductoVentaCard
            key={producto.id}
            nombre={producto.nombre}
            precio={Number(producto.precio)}
            tipo={producto.tipo}
            cantidad={cantidades[producto.id] ?? 0}
            onSumar={() => onCambiarCantidad(producto, 1)}
            onRestar={() => onCambiarCantidad(producto, -1)}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoriaProductos;
