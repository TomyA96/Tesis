import GenericTable from "../../../../ui/componentes/GenericTable/GenericTable";
import Header from "../../../../ui/componentes/Header";
import ContenedorDatos from "../../../../ui/componentes/ContenedorDatos";
import FiltroAuditorias from "../components/FiltroAuditorias";
import { auditoriasMock } from "../auditorias.mock";
import type { Auditoria, ResultadoAuditoria } from "../types";
import type { Column } from "../../../../ui/componentes/GenericTable/GenericTable.types";

const BadgeResultado = ({ resultado }: { resultado: ResultadoAuditoria }) => {
  const estilos: Record<ResultadoAuditoria, string> = {
    t: "bg-emerald-100 text-emerald-700",
    f: "bg-red-100 text-red-600",
  };

  const etiquetas: Record<ResultadoAuditoria, string> = {
    t: "Exito",
    f: "Fracaso",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[resultado]}`}>
      {etiquetas[resultado]}
    </span>
  );
};

const columnasAuditorias: Column<Auditoria>[] = [
  { key: "usuario", label: "Usuario" },
  { key: "accionRealizada", label: "Accion realizada" },
  { key: "fecha", label: "Fecha" },
  { key: "hora", label: "Hora" },
  {
    key: "resultado",
    label: "Resultado",
    render: (val) => <BadgeResultado resultado={val as ResultadoAuditoria} />,
  },
];

const Auditorias = () => {
  return (
    <main className="flex flex-col gap-6 px-6">
      <ContenedorDatos>
        <Header titulo="Auditorias" />

        <div className="px-6 pt-2 pb-4">
          <FiltroAuditorias
            resultado={[
              { res: "t", label: "Exito" },
              { res: "f", label: "Fracaso" },
            ]}
          />
        </div>

        <GenericTable<Auditoria>
          columns={columnasAuditorias}
          data={auditoriasMock}
        />
      </ContenedorDatos>
    </main>
  );
};

export default Auditorias;
