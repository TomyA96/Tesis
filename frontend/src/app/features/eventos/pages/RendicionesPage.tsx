import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../../../ui/componentes/Header";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import { CalendarDays } from "lucide-react";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import PanelRendicion from "../componentes/PanelRendicion";
import HistorialRendiciones from "../componentes/HistorialRendiciones";
import { cn } from "../../../../lib/cn";
import { RUTAS } from "../../../constantes/Rutas";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { getEvento, type Evento } from "../../../services/eventosService";
import { getLocalesDeEvento, getRendiciones, type LocalDeEvento, type Rendicion } from "../../../services/rendicionesService";

/*
    Rendición de cuentas con los puntos de venta de un evento: a la
    izquierda los locales que tuvieron tickets (con lo que tienen pendiente
    y lo que deben), a la derecha la rendición del elegido y abajo el
    historial. El local va en la URL (?local=2), así se puede volver o
    llegar desde el botón "Rendir" del evento.
*/
const RendicionesPage = () => {
    const { idEvento } = useParams();
    const [params, setParams] = useSearchParams();
    const idLocal = Number(params.get("local")) || null;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [locales, setLocales] = useState<LocalDeEvento[]>([]);
    const [rendiciones, setRendiciones] = useState<Rendicion[]>([]);
    const [aviso, setAviso] = useState("");
    const [error, setError] = useState("");
    // Cambia después de registrar: vuelve a montar el panel para que traiga lo pendiente actualizado
    const [version, setVersion] = useState(0);

    const cargar = async (id: number) => {
        try {
            const [eventoBuscado, localesEvento, rendicionesEvento] = await Promise.all([
                getEvento(id),
                getLocalesDeEvento(id),
                getRendiciones(id),
            ]);
            setEvento(eventoBuscado);
            setLocales(localesEvento);
            setRendiciones(rendicionesEvento);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar las rendiciones");
        }
    };

    useEffect(() => {
        setEvento(null);
        setLocales([]);
        setRendiciones([]);
        setAviso("");
        if (idEvento) cargar(Number(idEvento));
    }, [idEvento]);

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

    const local = locales.find((l) => l.puntoVenta.id === idLocal);
    const historial = idLocal ? rendiciones.filter((r) => r.puntoVenta.id === idLocal) : rendiciones;

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                volver={{ to: RUTAS.eventos.detalle(evento.id), label: evento.nombre }}
                icono={<CalendarDays />}
                seccion="Eventos"
                titulo="Rendiciones"
                acciones={
                    <LinkBtn to={RUTAS.eventos.tickets(evento.id)} variant="outline" size="sm">
                        Entregar tickets
                    </LinkBtn>
                }
            />
            <ContenedorDatos>

                {aviso && <p role="status" className="px-6 pt-3 text-sm text-emerald-700">{aviso}</p>}

                {locales.length === 0 ? (
                    <p className="py-16 text-center text-sm text-gray-400">
                        Aún no se asignó ningún ticket a los puntos de venta. Se entregan desde la pantalla de tickets.
                    </p>
                ) : (
                    <div className="grid gap-6 p-6 lg:grid-cols-[260px_1fr]">
                        {/* ── LOCALES ─────────────────────────────────────────── */}
                        <nav aria-label="Puntos de venta" className="flex flex-col gap-2">
                            {locales.map((l) => {
                                const elegido = l.puntoVenta.id === idLocal;
                                const debe = Number(l.saldo);
                                return (
                                    <button
                                        key={l.puntoVenta.id}
                                        type="button"
                                        aria-current={elegido}
                                        onClick={() => {
                                            setAviso("");
                                            setParams({ local: String(l.puntoVenta.id) });
                                        }}
                                        className={cn(
                                            "flex cursor-pointer flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                                            elegido ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50",
                                        )}
                                    >
                                        <span className="font-semibold text-gray-800">{l.puntoVenta.nombre}</span>
                                        <span className="text-xs text-gray-500">
                                            {l.pendientes === 0 ? "Sin tickets pendientes" : `${l.pendientes} pendientes de rendir`}
                                        </span>
                                        {debe > 0 && <span className="text-xs font-medium text-amber-700">Debe {formatPrecio(debe)}</span>}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* ── RENDICIÓN DEL ELEGIDO ───────────────────────────── */}
                        <section className="rounded-xl border border-gray-200">
                            {local ? (
                                <>
                                    <h2 className="border-b border-gray-100 px-6 py-4 font-semibold text-gray-900">
                                        Rendición de {local.puntoVenta.nombre}
                                    </h2>
                                    <PanelRendicion
                                        key={`${local.puntoVenta.id}-${version}`}
                                        idEvento={evento.id}
                                        puntoVenta={local.puntoVenta}
                                        onRegistrada={async () => {
                                            await cargar(evento.id);
                                            setVersion((v) => v + 1);
                                            setAviso(`Se registró la rendición de ${local.puntoVenta.nombre}`);
                                        }}
                                    />
                                </>
                            ) : (
                                <p className="p-6 text-sm text-gray-400">Elegí un punto de venta para armar su rendición</p>
                            )}
                        </section>
                    </div>
                )}
            </ContenedorDatos>

            <ContenedorDatos>
                <Header titulo={local ? `Rendiciones de ${local.puntoVenta.nombre}` : "Rendiciones del evento"} />
                <HistorialRendiciones rendiciones={historial} />
            </ContenedorDatos>
        </main>
    );
};

export default RendicionesPage;
