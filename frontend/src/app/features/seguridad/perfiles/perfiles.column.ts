import type { Column } from "../../../ui/componentes/GenericTable/GenericTable.types";
import type { Perfil } from "../../../services/perfilesService";

export const columnasPerfiles: Column<Perfil>[] = [
{
    key: "id",
    label: "#",
    render: (value) => String(value).padStart(3, "0"),
},
{
    key: "nombre",
    label: "Perfil",

},
{
    key: "descripcion",
    label: "Descripción",
},
];
