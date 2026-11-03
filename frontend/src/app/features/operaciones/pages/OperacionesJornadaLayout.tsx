import { Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { RUTAS } from "../../../constantes/Rutas";

/*
    Envoltorio común de las pantallas que se operan sobre una jornada
    (accesos, venta de entradas y buffet): una barra para volver al inicio de
    operaciones y debajo la pantalla elegida. El id de la jornada viaja en la
    URL (/admin/operaciones/jornadas/:idJornada/...): cada pantalla lo lee con
    useParams cuando necesite los datos de la jornada.
*/
const OperacionesJornadaLayout = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="px-6">
                <LinkBtn variant="outline" size="sm" to={RUTAS.operaciones.inicio} className="inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a operaciones
                </LinkBtn>
            </div>
            <Outlet />
        </div>
    );
};

export default OperacionesJornadaLayout;
