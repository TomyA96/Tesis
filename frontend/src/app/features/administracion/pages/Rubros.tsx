import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTabla";
import Header from "../../../ui/componentes/Header";

type Rubro = {
  id: number;
  nombre: string;
  tipo: "Ingreso" | "Gasto" | "Mixto";
};

const tiposEstilo: Record<Rubro["tipo"], string> = {
  Ingreso: "bg-emerald-50 text-emerald-700",
  Gasto: "bg-rose-50 text-rose-700",
  Mixto: "bg-amber-50 text-amber-700",
};

const rubrosData: Rubro[] = [
  { id: 1, nombre: "Publicidad", tipo: "Gasto" },
  { id: 2, nombre: "Sponsors", tipo: "Ingreso" },
  { id: 3, nombre: "Buffet", tipo: "Mixto" },
  { id: 4, nombre: "Entradas", tipo: "Ingreso" },
  { id: 5, nombre: "Produccion tecnica", tipo: "Gasto" },
];

const Rubros = () => {
  return (
    <main className="md:px-6">
      <ContenedorDatos>
        <Header
          titulo="Rubros"
          action={<Btn>+ Crear Rubro</Btn>}
        />

        <GenericTable<Rubro>
          columns={["id", "nombre", "tipo"]}
          data={rubrosData}
          cellRenderers={{
            tipo: (value) => (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tiposEstilo[value as Rubro["tipo"]]}`}>
                {value as Rubro["tipo"]}
              </span>
            ),
          }}
          actions={() => (
            <>
              <Btn variant="outline" size="sm">Modificar</Btn>
              <Btn variant="danger" size="sm">Eliminar</Btn>
            </>
          )}
        />
      </ContenedorDatos>
    </main>
  );
};

export default Rubros;
