import ProductoVentaCard from "./ProductoVentaCard";

type Producto = {
  nombre: string;
  precio: string;
  descripcion: string;
  color: string;
};

type CategoriaProductosProps = {
  titulo: string;
  descripcion: string;
  productos: Producto[];
};

const CategoriaProductos = ({
  titulo,
  descripcion,
  productos,
}: CategoriaProductosProps) => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{titulo}</h2>
          <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {productos.length} productos
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {productos.map((producto) => (
          <ProductoVentaCard
            key={producto.nombre}
            nombre={producto.nombre}
            precio={producto.precio}
            descripcion={producto.descripcion}
            color={producto.color}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoriaProductos;
