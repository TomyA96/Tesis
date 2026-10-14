import { Outlet } from "react-router-dom";
import EncabezadoPublico from "../features/publico/componentes/EncabezadoPublico";
import PiePublico from "../features/publico/componentes/PiePublico";

/*
    Marco común de las páginas públicas. El main de cada página usa flex-1
    para ocupar el espacio que sobra, así el pie queda al fondo de la
    pantalla incluso cuando el contenido es corto.
*/
const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <EncabezadoPublico />
            <Outlet />
            <PiePublico />
        </div>
    );
};

export default PublicLayout;
