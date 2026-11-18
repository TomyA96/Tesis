import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../../../ui/componentes/Header";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import { CalendarDays } from "lucide-react";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import EntregaPorCantidad from "../componentes/EntregaPorCantidad";
import ListaTicketsLote from "../componentes/ListaTicketsLote";
import { RUTAS } from "../../../constantes/Rutas";
import { nombreJornada } from "../utils/jornadaForm";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";
import { getEvento, type Evento } from "../../../services/eventosService";
import { getEntradasDeEvento, type Entrada } from "../../../services/entradasService";
import { getPuntosVenta, type PuntoVenta } from "../../../services/puntosVentaService";
import { descargarComprobante, getEntregas, type Entrega } from "../../../services/entregasService";

/*
    Tickets físicos de un evento. Dos vistas en la misma pantalla:
    - sin ?lote=: entregar tickets a un local por cantidad, jornada por
      jornada, y el historial de entregas con su comprobante;
    - con ?lote=: la lista de ese lote, ticket por ticket, para corregir.
    ?jornada= abre esa jornada al entrar (desde su tarjeta en el evento).
*/
const TicketsPage = () => {
    const { idEvento } = useParams();
    const [params] = useSearchParams();
    const idLote = Number(params.get("lote")) || null;
    const idJornadaInicial = Number(params.get("jornada")) || undefined;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [lotes, setLotes] = useState<Entrada[]>([]);
    const [puntos, setPuntos] = useState<PuntoVenta[]>([]);
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [error, setError] = useState("");

    const cargar = useCallback(async (id: number) => {
        const [eventoBuscado, lotesBuscados, entregasBuscadas] = await Promise.all([
            getEvento(id),
            getEntradasDeEvento(id),
            getEntregas(id).catch(() => []),
        ]);
        setEvento(eventoBuscado);
        // La boletería no tiene tickets en mano: no se entrega ni se corrige desde acá
        setLotes(lotesBuscados.filter((l) => !l.esBoleteria));
        setEntregas(entregasBuscadas);
    }, []);

    useEffect(() => {
        setEvento(null);
        if (!idEvento) return;
        cargar(Number(idEvento)).catch(() => setError("No se pudo cargar el evento"));
        getPuntosVenta()
            .then(setPuntos)
            .catch(() => setError("No se pudieron cargar los puntos de venta"));
    }, [idEvento, cargar]);

    const recargar = async () => {
        if (idEvento) await cargar(Number(idEvento));
    };

    if (error) {
        return (
            <main className="px-8">
                <p role="alert" className="text-sm text-red-600">{error}</p>
            </main>
        );
    }
    if (!evento || evento.id !== Number(idEvento)) {
        return (
            <main className="px-8">
                <p className="text-sm text-gray-500">Cargando…</p>
            </main>
        );
    }

    const titulos: Record<number, string> = Object.fromEntries(evento.jornadas.map((j, i) => [j.id, nombreJornada(j, i)]));
    const lote = lotes.find((l) => l.id === idLote);
    const jornadaDelLote = lote && evento.jornadas.find((j) => j.id === lote.idJornada);

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                volver={{ to: RUTAS.eventos.detalle(evento.id), label: evento.nombre }}
                icono={<CalendarDays />}
                seccion="Eventos"
                titulo={lote && jornadaDelLote ? `${lote.descripcion} · ${titulos[jornadaDelLote.id]}` : "Entregar tickets"}
                acciones={
                    <>
                        {lote && (
                            <LinkBtn to={RUTAS.eventos.tickets(evento.id)} variant="outline" size="sm">
                                ← Entregar por cantidad
                            </LinkBtn>
                        )}
                        <LinkBtn to={RUTAS.eventos.rendiciones(evento.id)} variant="outline" size="sm">
                            Rendiciones
                        </LinkBtn>
                    </>
                }
            />
            <ContenedorDatos>

                {idLote && !lote && <p className="p-6 text-sm text-gray-500">Ese lote no es de este evento.</p>}
                {lote && !lote.esFisica && (
                    <p className="p-6 text-sm text-gray-500">
                        Los tickets online no se manejan sueltos: el lote se pausa o se anula entero desde la jornada.
                    </p>
                )}
                {lote && lote.esFisica && jornadaDelLote && (
                    <ListaTicketsLote lote={lote} jornada={jornadaDelLote} puntos={puntos} onCambio={recargar} />
                )}
                {!idLote && (
                    <EntregaPorCantidad
                        idEvento={evento.id}
                        jornadas={evento.jornadas}
                        titulos={titulos}
                        lotes={lotes}
                        puntos={puntos}
                        jornadaInicial={idJornadaInicial}
                        onEntregada={recargar}
                    />
                )}
            </ContenedorDatos>

            {/* ── HISTORIAL DE ENTREGAS ─────────────────────────────────────── */}
            {!idLote && (
                <ContenedorDatos>
                    <Header titulo="Entregas realizadas" />
                    {entregas.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-gray-400">Aún no se entregaron tickets a los puntos de venta.</p>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Punto de venta</th>
                                        <th className="px-6 py-3 text-right">Tickets</th>
                                        <th className="px-6 py-3">Observación</th>
                                        <th className="px-6 py-3">Entregó</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {entregas.map((e) => (
                                        <tr key={e.id} className="border-b border-gray-100 last:border-none text-gray-700">
                                            <td className="px-6 py-3 whitespace-nowrap">{fechaArgentina(e.fechaHora)} {horaArgentina(e.fechaHora)}</td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{e.puntoVenta.nombre}</td>
                                            <td className="px-6 py-3 text-right">
                                                {e._count.tickets === 0 ? (
                                                    <span className="font-medium text-rose-700" title={`Originalmente ${e.cantidadOriginal}`}>
                                                        Anulada (0)
                                                    </span>
                                                ) : e._count.tickets < e.cantidadOriginal ? (
                                                    <span>
                                                        {e._count.tickets}
                                                        <span className="block text-xs text-amber-700">corregida: originalmente {e.cantidadOriginal}</span>
                                                    </span>
                                                ) : (
                                                    e._count.tickets
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500">{e.observacion ?? "—"}</td>
                                            <td className="px-6 py-3">{e.usuario.nombre}</td>
                                            <td className="px-6 py-3 text-right">
                                                <Btn size="sm" variant="outline" onClick={() => descargarComprobante(e.id, e.puntoVenta.nombre)}>
                                                    Comprobante
                                                </Btn>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ContenedorDatos>
            )}
        </main>
    );
};

export default TicketsPage;
