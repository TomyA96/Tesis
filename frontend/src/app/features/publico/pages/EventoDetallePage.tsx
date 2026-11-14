import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronUp, ImageOff, X } from "lucide-react";
import { API_URL } from "../../../services/api";
import { getEventoPublicado, type EventoDetalle } from "../../../services/eventosService";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import { fechasDelEvento } from "../fechasEvento";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";
import FondoMosaico from "../../../ui/componentes/FondoMosaico";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import JornadaPublica from "../componentes/JornadaPublica";
import TuCompra from "../componentes/TuCompra";
import { RUTAS } from "../../../constantes/Rutas";
import { MAX_POR_COMPRA, cantidadDeLineas, totalDeLineas, type LineaCompra } from "../compra";

/*
    Detalle público de un evento. En compu: a la izquierda la imagen y
    debajo "Tu compra", que bajan juntas (sticky); a la derecha los datos
    del evento y sus jornadas, cada una desplegable con sus entradas. En
    celular: la imagen como encabezado, las jornadas abajo, y lo elegido en
    una barra fija al pie que se abre en un panel.
*/
const EventoDetallePage = () => {
    const { idEvento } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState<EventoDetalle | null>(null);
    const [error, setError] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, number>>({});
    // Las jornadas desplegadas: al entrar, la primera
    const [abiertas, setAbiertas] = useState<Set<number>>(new Set());
    // Celular: el panel con el detalle de la compra
    const [panelAbierto, setPanelAbierto] = useState(false);

    useEffect(() => {
        getEventoPublicado(Number(idEvento))
            .then((response) => {
                setEvento(response);
                // La primera que se puede comprar (una agotada no se despliega)
                const primera = response.jornadas.find((j) => j.entradas.length > 0) ?? response.jornadas[0];
                setAbiertas(new Set(primera ? [primera.id] : []));
            })
            .catch(() => setError("Se produjo un error al cargar el evento"));
    }, [idEvento]);

    const cambiarCantidad = (idEntrada: number, cambio: number) =>
        setCantidades((prev) => {
            const nueva = Math.min(MAX_POR_COMPRA, Math.max(0, (prev[idEntrada] ?? 0) + cambio));
            return { ...prev, [idEntrada]: nueva };
        });

    const alternar = (idJornada: number) =>
        setAbiertas((prev) => {
            const nuevas = new Set(prev);
            if (nuevas.has(idJornada)) nuevas.delete(idJornada);
            else nuevas.add(idJornada);
            return nuevas;
        });

    // El nombre de cada jornada ("Evento N" si no tiene: al público no se le habla de "jornadas") y su fecha: así se distinguen en la compra
    const titulos = useMemo(
        () =>
            Object.fromEntries(
                (evento?.jornadas ?? []).map((j, i) => [j.id, `${j.nombre || `Evento ${i + 1}`} · ${fechaCortaConDia(j.fechaHoraInicio)}`]),
            ) as Record<number, string>,
        [evento],
    );

    // Solo las entradas con cantidad elegida, en el orden de las jornadas
    const lineas: LineaCompra[] = useMemo(
        () =>
            (evento?.jornadas ?? []).flatMap((jornada) =>
                jornada.entradas
                    .filter((e) => (cantidades[e.id] ?? 0) > 0)
                    .map((e) => ({
                        idEntrada: e.id,
                        descripcion: e.descripcion,
                        cantidad: cantidades[e.id],
                        precioUnitario: Number(e.precio),
                        jornada: { id: jornada.id, titulo: titulos[jornada.id] },
                    })),
            ),
        [evento, cantidades, titulos],
    );

    // Si se quitó todo desde el panel del celular, no queda nada que mostrar en él
    useEffect(() => {
        if (lineas.length === 0) setPanelAbierto(false);
    }, [lineas.length]);

    if (error) {
        return (
            <main className="flex-1 bg-gray-50 p-8">
                <p className="text-sm text-red-600">{error}</p>
            </main>
        );
    }

    if (!evento) {
        return (
            <main className="relative isolate flex-1 bg-gray-50 p-8">
                <FondoMosaico />
                <p className="text-sm text-gray-500">Cargando evento…</p>
            </main>
        );
    }

    const imagen = evento.imagenes[0];
    const comprar = () => navigate(RUTAS.publico.comprar(evento.id), { state: { lineas } });

    return (
        // pb-28 en celular: lugar para que la barra fija no tape la última jornada
        <main className="relative isolate flex flex-1 justify-center bg-gray-300 p-0 pb-28 md:p-8">
            <FondoMosaico />
            <ContenedorDatos className="flex max-w-6xl flex-col overflow-visible rounded-none md:flex-row md:gap-8 md:rounded-2xl md:p-6">
                {/* ── IZQUIERDA (compu): imagen + Tu compra, bajan juntas ──────── */}
                <div className="flex flex-col gap-5 md:sticky md:top-6 md:w-5/12 md:self-start">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 md:aspect-[4/3] md:rounded-2xl">
                        {imagen ? (
                            <img src={`${API_URL}${imagen.url}`} alt={evento.nombre} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <ImageOff className="h-10 w-10" />
                            </div>
                        )}
                    </div>

                    <section className="hidden flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 md:flex" aria-label="Tu compra">
                        <h2 className="text-lg font-semibold text-noche pl-3 border-l-4 border-sol">Tu compra</h2>
                        <TuCompra lineas={lineas} onCambiarCantidad={cambiarCantidad} onComprar={comprar} />
                    </section>
                </div>

                {/* ── DERECHA: datos del evento y jornadas ─────────────────────── */}
                <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-0 md:py-2">
                    <section className="flex flex-col gap-3">
                        <h1 className="text-3xl font-bold text-noche pl-4 border-l-4 border-sol">{evento.nombre}</h1>
                        <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDays className="h-5 w-5 text-marca" />
                            <span>{fechasDelEvento(evento.jornadas)}</span>
                        </div>
                        {evento.descripcion && (
                            <div className="rounded-2xl bg-gray-600 p-4 text-white">
                                <h4 className="font-semibold">Acerca del evento</h4>
                                <p className="text-sm">{evento.descripcion}</p>
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-xl font-semibold text-noche pl-4 border-l-4 border-sol">
                            {evento.jornadas.length === 1 ? "Entradas" : "Eventos"}
                        </h2>
                        {evento.jornadas.map((jornada) => (
                            <JornadaPublica
                                key={jornada.id}
                                jornada={jornada}
                                titulo={titulos[jornada.id].split(" · ")[0]}
                                abierta={abiertas.has(jornada.id)}
                                onAlternar={() => alternar(jornada.id)}
                                cantidades={cantidades}
                                onCambiarCantidad={cambiarCantidad}
                            />
                        ))}
                    </section>
                </div>
            </ContenedorDatos>

            {/* ── CELULAR: barra fija con lo elegido, y su panel ──────────────── */}
            {lineas.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-20 md:hidden">
                    {panelAbierto && (
                        <>
                            {/* Toque afuera del panel: lo cierra */}
                            <button
                                type="button"
                                aria-label="Cerrar el detalle de la compra"
                                className="fixed inset-0 -z-10 bg-black/40"
                                onClick={() => setPanelAbierto(false)}
                            />
                            <section className="rounded-t-2xl bg-white p-5 shadow-2xl" aria-label="Tu compra">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-noche">Tu compra</h2>
                                    <button
                                        type="button"
                                        onClick={() => setPanelAbierto(false)}
                                        aria-label="Cerrar"
                                        className="cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <TuCompra lineas={lineas} onCambiarCantidad={cambiarCantidad} onComprar={comprar} />
                            </section>
                        </>
                    )}
                    {!panelAbierto && (
                        <button
                            type="button"
                            onClick={() => setPanelAbierto(true)}
                            className="flex w-full cursor-pointer items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
                        >
                            <span className="text-sm text-gray-700">
                                <strong className="text-noche">{cantidadDeLineas(lineas)}</strong> entrada{cantidadDeLineas(lineas) === 1 ? "" : "s"} ·{" "}
                                <strong className="text-noche">{formatPrecioEntrada(totalDeLineas(lineas))}</strong>
                            </span>
                            <span className="flex items-center gap-1 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white">
                                Ver compra <ChevronUp className="h-4 w-4" />
                            </span>
                        </button>
                    )}
                </div>
            )}
        </main>
    );
};

export default EventoDetallePage;
