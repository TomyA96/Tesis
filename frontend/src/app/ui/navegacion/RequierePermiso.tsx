import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import ContenedorDatos from "../componentes/ContenedorDatos";
import LinkBtn from "../componentes/LinkBtn";
import { RUTAS } from "../../constantes/Rutas";

type RequierePermisoProps = {
    permiso: string;
    children: ReactNode;
};

/*
    Deja pasar solo a quien tiene el permiso; a los demás les muestra un aviso
    en lugar de la pantalla. Esto controla lo que se ve: el backend es el que
    tiene que validar cada acción de verdad.
*/
const RequierePermiso = ({ permiso, children }: RequierePermisoProps) => {
    const { permisos, puede } = useAuth();

    // Los permisos se piden al backend después de abrir la página: hasta que llegan no se puede decidir
    if (permisos === null) {
        return <p className="px-6 text-sm text-gray-500">Cargando…</p>;
    }

    if (!puede(permiso)) {
        return (
            <ContenedorDatos className="mx-6 flex flex-col items-center gap-4 p-10 text-center">
                <h2 className="text-lg font-semibold text-gray-800">No tenés permiso para acceder a esta pantalla</h2>
                <p className="text-sm text-gray-500">Si lo necesitás para trabajar, pedíselo al administrador.</p>
                <LinkBtn variant="outline" to={RUTAS.operaciones.inicio}>
                    Volver a operaciones
                </LinkBtn>
            </ContenedorDatos>
        );
    }

    return <>{children}</>;
};

export default RequierePermiso;
