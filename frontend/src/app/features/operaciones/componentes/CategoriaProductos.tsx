import ProductoVentaCard from "./ProductoVentaCard";
import type { Producto } from "../../../services/productosService";

type CategoriaProductosProps = {
  productos: Producto[];
  cantidades: Record<number, number>;
  onCambiarCantidad: (producto: Producto, cambio: number) => void;
  // Qué decir si la pestaña elegida no tiene productos ("No hay bebidas asignadas…")
  vacio: string;
};

// Los productos de la pestaña elegida (Comidas o Bebidas), en una grilla de tarjetas compactas
const CategoriaProductos = ({ productos, cantidades, onCambiarCantidad, vacio }: CategoriaProductosProps) => {
  if (productos.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">{vacio}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4">
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
  );
};

export default CategoriaProductos;
