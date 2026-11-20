import LinkBtn from "../../../ui/componentes/LinkBtn";
import { RUTAS } from "../../../constantes/Rutas";
import { formatPrecio } from "../../../utils/formatoPrecio";
import type { Entrada } from "../../../services/entradasService";
import type { Jornada } from "../../../services/jornadasService";

/*
    Los lotes de una jornada en una línea cada uno, debajo de su tarjeta en
    el detalle del evento. Lo que se puede HACER con un lote online está en
    la pantalla de la jornada (su tarjeta); los físicos impresos se entregan
    a los locales desde la pantalla de tickets.
*/
const descripcionLote = (lote: Entrada) => {
    if (lote.estado === "Borrador") return `Borrador · ${lote.cantidad} tickets`;
    if (lote.estado === "Anulado") return `Anulado · ${lote.vendidos} vendidos`;
    if (!lote.esFisica) return `Vendidas ${lote.vendidos}/${lote.cantidad}${lote.habilitada ? "" : " · venta pausada"}`;
    return `En mano ${lote.enMano} · en locales ${lote.enLocales} · vendidos ${lote.vendidos}`;
};

type ResumenLotesJornadaProps = {
    idEvento: number;
    jornada: Jornada;
    lotes: Entrada[];
};

const ResumenLotesJornada = ({ idEvento, jornada, lotes: todos }: ResumenLotesJornadaProps) => {
    // La boletería no es un lote más: va aparte, al final, con su precio y lo vendido en la puerta
    const boleteria = todos.find((l) => l.esBoleteria);
    const lotes = todos.filter((l) => !l.esBoleteria);
    // Solo una jornada activa entrega tickets (una suspendida espera a que se reprograme)
    const abierta = jornada.estado === "Activo";
    // Hay algo para entregar si algún lote físico impreso tiene tickets en mano
    const hayParaEntregar = abierta && lotes.some((l) => l.esFisica && l.estado === "Disponible" && l.enMano > 0);

    return (
        <div className="flex flex-col gap-1.5 rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 px-4 py-3 text-xs">
            {lotes.length === 0 ? (
                <span className="text-gray-400">Sin lotes de entradas</span>
            ) : (
                lotes.map((lote) => (
                    <div key={lote.id} className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-medium text-gray-700" title={lote.descripcion}>
                            {lote.descripcion}
                            <span className="ml-1 font-normal text-gray-400">{lote.esFisica ? "física" : "online"}</span>
                        </span>
                        <span className="shrink-0 text-gray-500">{descripcionLote(lote)}</span>
                    </div>
                ))
            )}
            <div className="flex items-baseline justify-between gap-3 border-t border-gray-200 pt-1.5">
                <span className="font-medium text-gray-700">Boletería</span>
                {boleteria ? (
                    <span className="shrink-0 text-gray-500">
                        {formatPrecio(Number(boleteria.precio))} · vendidas {boleteria.vendidos}
                        {!boleteria.habilitada && " · pausada"}
                    </span>
                ) : (
                    <span className="shrink-0 text-gray-400">Sin configurar</span>
                )}
            </div>
            {hayParaEntregar && (
                <LinkBtn to={RUTAS.eventos.tickets(idEvento, { jornada: jornada.id })} variant="outline" size="sm" className="mt-1 w-fit">
                    Entregar tickets
                </LinkBtn>
            )}
        </div>
    );
};

export default ResumenLotesJornada;
