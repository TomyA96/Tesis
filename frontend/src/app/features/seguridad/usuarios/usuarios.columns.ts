import type { Column } from "../../../ui/componentes/GenericTable/GenericTable.types";
import { perfilesMock } from "../perfiles/perfiles.mock";
import type { Usuario } from "./usuarios.mock";

export const columnasUsuario: Column<Usuario>[] = [
  {
    key: "id",
    label: "#",
    render: (value) => String(value).padStart(3, "0"), // antes vivía en renderCelda
  },
  {
    key: "nombre",
    label: "Nombre",
  },
  {
    key: "perfil",
    label: "Perfil",
    render: (value) => {
        const perfil = perfilesMock.find((p) => p.id === value);
        return perfil ? perfil.nombre : "Desconocido";}
  },
  {
    key: "estado",
    label: "Estado",
  },
  
];
