import type { Column } from "../../../ui/componentes/GenericTable/GenericTable.types";
import type { Usuario } from "../../../services/usuariosService";
import { renderEstado } from "../../../ui/componentes/GenericTable/genericTabla.utils";

export const columnasUsuario: Column<Usuario>[] = [
  {
    key: "id",
    label: "#",
    render: (value) => String(value).padStart(3, "0"),
  },
  {
    key: "usuario",
    label: "Usuario",
  },
  {
    key: "nombre",
    label: "Nombre",
  },
  {
    key: "estado",
    label: "Estado",
    render: (value) => renderEstado(value as string),
  },
  {
    key: "ultimoAcceso",
    label: "Último acceso",
    render: (value) => (value ? new Date(value as string).toLocaleString() : "—"),
  },
];
