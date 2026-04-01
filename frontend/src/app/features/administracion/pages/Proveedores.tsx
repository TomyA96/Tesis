import Header from "../../../ui/componentes/Header";
import GenericTable from "../../../ui/componentes/GenericTabla";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Btn from "../../../ui/componentes/Btn";

const Proveedores = () => {
  return (
    // ✅ min-h-screen + bg-gray-100 da fondo gris suave a toda la página
    <main className=" md:px-6">
      <ContenedorDatos>
        <Header
          titulo="Proveedores"
          action={<Btn>+ Agregar Proveedor</Btn>}
        />

        <GenericTable
          columns={["id", "nombre", "contacto", "categoria"]}
          data={[
            { id: 1, nombre: "Proveedor A", contacto: "contacto@proveedora.com", categoria: "Alimentos" },
            { id: 2, nombre: "Proveedor B", contacto: "contacto@proveedorb.com", categoria: "Decoración" },
            { id: 3, nombre: "Proveedor C", contacto: "contacto@proveedorc.com", categoria: "Equipamiento" },
          ]}
          actions={(_row) => (
            <>
              {/* ✅ outline para editar (acción secundaria) */}
              <Btn variant="outline" size="sm">Editar</Btn>
              {/* ✅ danger para eliminar (acción destructiva) */}
              <Btn variant="danger" size="sm">Eliminar</Btn>
            </>
          )}
        />
      </ContenedorDatos>
    </main>
  );
};

export default Proveedores;
