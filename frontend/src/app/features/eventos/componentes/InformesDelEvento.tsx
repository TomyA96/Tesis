import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { RUTAS } from "../../../constantes/Rutas";

type InformesDelEventoProps = {
    idEvento: number;
};

/*
    Los informes son de un evento puntual, así que se llega a ellos desde su
    detalle. Una vez adentro, las pestañas permiten pasar de uno a otro.
*/
const InformesDelEvento = ({ idEvento }: InformesDelEventoProps) => (
    <ContenedorDatos className="gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Informes</h2>
            <div className="flex flex-wrap gap-2">
                <LinkBtn to={RUTAS.informes.general(idEvento)} variant="outline" size="sm">
                    General
                </LinkBtn>
                <LinkBtn to={RUTAS.informes.entradas(idEvento)} variant="outline" size="sm">
                    Entradas
                </LinkBtn>
                <LinkBtn to={RUTAS.informes.buffet(idEvento)} variant="outline" size="sm">
                    Buffet
                </LinkBtn>
                <LinkBtn to={RUTAS.informes.finanzas(idEvento)} variant="outline" size="sm">
                    Finanzas
                </LinkBtn>
            </div>
        </div>
    </ContenedorDatos>
);

export default InformesDelEvento;
