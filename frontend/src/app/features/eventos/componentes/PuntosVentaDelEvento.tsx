import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { RUTAS } from "../../../constantes/Rutas";
import { formatPrecio } from "../../../utils/formatoPrecio";
import type { LocalDeEvento } from "../../../services/rendicionesService";

type PuntosVentaDelEventoProps = {
    idEvento: number;
    locales: LocalDeEvento[];
};

/*
    Los locales que tienen (o tuvieron) tickets de este evento, con lo que
    les falta rendir. Es el acceso a la rendición: se rinde por local y
    evento, no por jornada ni por lote.
*/
const PuntosVentaDelEvento = ({ idEvento, locales }: PuntosVentaDelEventoProps) => (
    <ContenedorDatos className="gap-4 p-5">
        <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Puntos de venta</h2>
            <div className="flex flex-wrap gap-2">
                <LinkBtn to={RUTAS.eventos.tickets(idEvento)} variant="outline" size="sm">
                    Entregar tickets
                </LinkBtn>
                {locales.length > 0 && (
                    <LinkBtn to={RUTAS.eventos.rendiciones(idEvento)} variant="outline" size="sm">
                        Rendiciones
                    </LinkBtn>
                )}
            </div>
        </div>

        {locales.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no se asignó ningún ticket a los puntos de venta.</p>
        ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {locales.map((l) => {
                    const debe = Number(l.saldo);
                    return (
                        <li key={l.puntoVenta.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                            <div className="flex min-w-0 flex-col">
                                <span className="font-medium text-gray-800">{l.puntoVenta.nombre}</span>
                                <span className="text-xs text-gray-500">
                                    {l.pendientes === 0 ? "Sin tickets pendientes" : `${l.pendientes} tickets pendientes de rendir`}
                                    {debe > 0 && <span className="ml-2 font-medium text-amber-700">· Debe {formatPrecio(debe)}</span>}
                                </span>
                            </div>
                            <LinkBtn to={RUTAS.eventos.rendiciones(idEvento, l.puntoVenta.id)} size="sm" variant={l.pendientes > 0 || debe > 0 ? "primary" : "outline"}>
                                Rendir
                            </LinkBtn>
                        </li>
                    );
                })}
            </ul>
        )}
    </ContenedorDatos>
);

export default PuntosVentaDelEvento;
