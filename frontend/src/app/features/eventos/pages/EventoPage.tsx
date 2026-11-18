import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import EncabezadoPagina, { LinkVolver } from "../../../ui/componentes/EncabezadoPagina";
import { CalendarDays } from "lucide-react";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import Modal from "../../../ui/componentes/Modal";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import EventoForm from "../forms/EventoForm";
import CrearEventoForm from "../forms/CrearEventoForm";
import MiniaturaImagenEvento from "../componentes/MiniaturaImagenEvento";
import TarjetaJornada from "../componentes/TarjetaJornada";
import ResumenLotesJornada from "../componentes/ResumenLotesJornada";
import PuntosVentaDelEvento from "../componentes/PuntosVentaDelEvento";
import InformesDelEvento from "../componentes/InformesDelEvento";
import PublicarEventoModal from "../modales/PublicarEventoModal";
import AgregarJornadasModal from "../modales/AgregarJornadasModal";
import LoteEntradasModal from "../modales/LoteEntradasModal";
import ConfigurarBoleteriaModal from "../modales/ConfigurarBoleteriaModal";
import { RUTAS } from "../../../constantes/Rutas";
import {
    cancelarEvento,
    finalizarEvento,
    getEvento,
    getRevisionPublicacion,
    publicarEvento,
    suspenderEvento,
    type Evento,
    type RevisionJornada,
} from "../../../services/eventosService";
import { getEntradasDeEvento, type Entrada } from "../../../services/entradasService";
import { getLocalesDeEvento, type LocalDeEvento } from "../../../services/rendicionesService";
import { coloresEstadoEvento } from "../eventos.columns";
import { nombreJornada } from "../utils/jornadaForm";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";

// Qué ventana está abierta: una sola a la vez
type ModalEvento = "editar" | "agregar" | "entradas" | "boleteria" | "publicar" | "suspender" | "finalizar" | "cancelar" | "pendientes" | null;

/*
    Detalle de un evento: arriba sus datos en chico, abajo una tarjeta por
    jornada. Cada tarjeta lleva a la pantalla de esa jornada (JornadaPage),
    que es donde se trabaja cada una (editar, entradas, publicar, cerrar).
    Sin idEvento en la URL, la misma ruta sirve para crear un evento nuevo.
*/
const EventoPage = () => {
    const { idEvento } = useParams();
    const navigate = useNavigate();
    // Si el evento se acaba de crear y la imagen falló, el formulario de crear dejó el motivo acá
    const avisoImagen = (useLocation().state as { avisoImagen?: string } | null)?.avisoImagen;

    const [evento, setEvento] = useState<Evento | null>(null);
    // Las jornadas en Borrador y lo que le falta a cada una para publicarse
    const [revision, setRevision] = useState<RevisionJornada[]>([]);
    // Los lotes de todas las jornadas (resumen debajo de cada tarjeta) y los locales con tickets del evento
    const [lotes, setLotes] = useState<Entrada[]>([]);
    const [locales, setLocales] = useState<LocalDeEvento[]>([]);
    // null mientras no se sabe (la miniatura todavía no la buscó)
    const [tieneImagen, setTieneImagen] = useState<boolean | null>(null);
    const [error, setError] = useState("");
    const [modal, setModal] = useState<ModalEvento>(null);

    /*
        Trae el evento y la revisión juntos. Si la revisión falla, la pantalla
        sirve igual (solo no muestra los avisos), por eso su error se ignora.
    */
    const cargar = useCallback(async (id: number) => {
        const [eventoBuscado, revisionBuscada, lotesBuscados] = await Promise.all([
            getEvento(id),
            getRevisionPublicacion(id).catch(() => []),
            getEntradasDeEvento(id).catch(() => []),
        ]);
        // Un evento en Borrador no tiene tickets: no hay locales que consultar
        const localesBuscados = eventoBuscado.estado === "Borrador" ? [] : await getLocalesDeEvento(id).catch(() => []);
        setEvento(eventoBuscado);
        setRevision(revisionBuscada);
        setLotes(lotesBuscados);
        setLocales(localesBuscados);
    }, []);

    useEffect(() => {
        // Al cambiar de evento se arranca de cero: React reutiliza esta instancia entre rutas
        setModal(null);
        setEvento(null);
        setRevision([]);
        setLotes([]);
        setLocales([]);
        setTieneImagen(null);
        setError("");

        if (!idEvento) return;
        cargar(Number(idEvento)).catch(() => setError("No se pudo cargar el evento"));
    }, [idEvento, cargar]);

    // Después de cada acción: el estado del evento y de sus jornadas pudo cambiar
    const recargar = async () => {
        if (idEvento) await cargar(Number(idEvento));
    };

    if (!idEvento) {
        return (
            <main className="flex flex-col gap-6 px-6 pb-8">
                <EncabezadoPagina
                    volver={{ to: RUTAS.eventos.inicio, label: "Eventos" }}
                    icono={<CalendarDays />}
                    seccion="Eventos"
                    titulo="Nuevo evento"
                />
                <ContenedorDatos className="p-6">
                    <CrearEventoForm
                        onCreated={(nuevo, avisoImagen) =>
                            // El state viaja con la navegación: es la forma de pasarle el aviso a la pantalla de detalle
                            navigate(RUTAS.eventos.detalle(nuevo.id), { state: { avisoImagen } })
                        }
                    />
                </ContenedorDatos>
            </main>
        );
    }
    if (error) {
        return (
            <main className="px-8">
                <p className="text-sm text-red-600">{error}</p>
            </main>
        );
    }
    // El evento guardado puede ser el anterior por un render (el efecto lo limpia después): se compara el id
    if (!evento || evento.id !== Number(idEvento)) {
        return (
            <main className="px-8">
                <p className="text-sm text-gray-500">Cargando evento…</p>
            </main>
        );
    }

    // Llegan ordenadas por fecha de inicio: el índice es el número de "Jornada N"
    const jornadas = evento.jornadas;
    const titulos: Record<number, string> = Object.fromEntries(jornadas.map((j, i) => [j.id, nombreJornada(j, i)]));
    const faltantesPorId = new Map(revision.map((r) => [r.id, r.faltantes]));

    const borradores = jornadas.filter((j) => j.estado === "Borrador").length;
    // Las que todavía no tienen cierre: el evento no se puede finalizar con alguna así
    const abiertas = jornadas.filter((j) => j.estado === "Activo" || j.estado === "Suspendido");
    const hayActivas = jornadas.some((j) => j.estado === "Activo");
    /*
        Cancelar el evento sigue la regla de cada jornada: se cancelan las
        suspendidas y las activas que todavía no empezaron. Las que ya
        empezaron se hicieron: quedan para finalizar.
    */
    const ahora = new Date();
    const cancelables = jornadas.filter(
        (j) => j.estado === "Suspendido" || (j.estado === "Activo" && new Date(j.fechaHoraInicio) > ahora),
    );
    const paraFinalizar = jornadas.filter((j) => j.estado === "Activo" && new Date(j.fechaHoraInicio) <= ahora);
    // Las que todavía pueden recibir entradas: ni finalizadas ni canceladas
    const conEntradas = jornadas.filter((j) => j.estado !== "Finalizado" && j.estado !== "Cancelado");
    const finalizado = evento.estado === "Finalizado";
    const sePuedePublicar = (evento.estado === "Borrador" || evento.estado === "Activo") && revision.length > 0;

    // Avisa cuántas jornadas en Borrador se pierden al cerrar el evento (el backend lo exige confirmado)
    const avisoBorradores =
        borradores > 0 ? ` y descartar ${borradores} jornada(s) en borrador que nunca se publicaron` : "";

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <LinkVolver to={RUTAS.eventos.inicio} label="Eventos" />

            {avisoImagen && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    El evento se creó, pero no se pudo subir la imagen ({avisoImagen}). Podés volver a subirla desde la
                    miniatura de abajo; la necesitás para publicar el evento.
                </p>
            )}

            {/* ── CABECERA: datos del evento en chico ─────────────────────── */}
            {/* Misma caja y mismo título que EncabezadoPagina; en vez del ícono, la imagen del evento */}
            <ContenedorDatos className="gap-3 border border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <MiniaturaImagenEvento idEvento={evento.id} bloqueado={finalizado} onCambio={setTieneImagen} />

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Eventos</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{evento.nombre}</h1>
                            <Etiqueta color={coloresEstadoEvento[evento.estado]}>{evento.estado}</Etiqueta>
                        </div>
                        <span className="text-sm text-gray-500">
                            {jornadas.length} jornada(s) ·{" "}
                            {/* Si empieza y termina el mismo día, "del sáb 5/12 al sáb 5/12" sobra */}
                            {fechaCortaConDia(evento.fechaHoraInicio) === fechaCortaConDia(evento.fechaHoraFin)
                                ? fechaCortaConDia(evento.fechaHoraInicio)
                                : `del ${fechaCortaConDia(evento.fechaHoraInicio)} al ${fechaCortaConDia(evento.fechaHoraFin)}`}
                        </span>
                        {evento.descripcion ? (
                            <p className="line-clamp-2 text-sm text-gray-600" title={evento.descripcion}>
                                {evento.descripcion}
                            </p>
                        ) : (
                            <p className="text-sm italic text-gray-400">Sin descripción</p>
                        )}
                        {/* Editar va con los datos que modifica, separado de las acciones que cambian el estado */}
                        {!finalizado && (
                            <Btn variant="outline" size="sm" className="mt-2 w-fit" onClick={() => setModal("editar")}>
                                Editar datos
                            </Btn>
                        )}
                    </div>

                    {/*
                        Las acciones que cambian el estado del evento completo, una
                        debajo de otra y del mismo ancho; las de cada jornada están
                        en su pantalla.
                    */}
                    <div className="flex flex-col gap-2 md:w-44">
                        {sePuedePublicar && (
                            <Btn variant="success" size="sm" onClick={() => setModal("publicar")}>
                                {evento.estado === "Borrador" ? "Publicar" : "Publicar jornadas"}
                            </Btn>
                        )}
                        {evento.estado === "Activo" && hayActivas && (
                            <Btn variant="warning" size="sm" onClick={() => setModal("suspender")}>
                                Suspender
                            </Btn>
                        )}
                        {evento.estado === "Activo" && (
                            // Si quedan jornadas sin cierre, en vez de intentar se le muestra cuáles son
                            <Btn variant="secondary" size="sm" onClick={() => setModal(abiertas.length > 0 ? "pendientes" : "finalizar")}>
                                Finalizar
                            </Btn>
                        )}
                        {evento.estado === "Activo" && cancelables.length > 0 && (
                            <Btn variant="danger" size="sm" onClick={() => setModal("cancelar")}>
                                Cancelar evento
                            </Btn>
                        )}
                    </div>
                </div>

                {tieneImagen === false && !finalizado && (
                    <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
                        Falta la imagen del evento: la necesitás para publicar.
                    </p>
                )}
            </ContenedorDatos>

            {/* ── JORNADAS ─────────────────────────────────────────────────── */}
            <ContenedorDatos className="gap-4 p-5">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Jornadas ({jornadas.length})</h2>
                    <div className="flex flex-wrap gap-2">
                        {conEntradas.length > 0 && (
                            <>
                                <Btn variant="outline" size="sm" onClick={() => setModal("entradas")}>
                                    + Lote de entradas
                                </Btn>
                                <Btn variant="outline" size="sm" onClick={() => setModal("boleteria")}>
                                    Configurar boletería
                                </Btn>
                            </>
                        )}
                        {!finalizado && (
                            <Btn size="sm" onClick={() => setModal("agregar")}>
                                + Agregar jornadas
                            </Btn>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
                    {jornadas.map((jornada) => (
                        <div key={jornada.id} className="flex flex-col">
                            <TarjetaJornada
                                jornada={jornada}
                                titulo={titulos[jornada.id]}
                                to={RUTAS.eventos.jornada(evento.id, jornada.id)}
                                faltantes={faltantesPorId.get(jornada.id)}
                                className="flex-1 rounded-b-none"
                            />
                            <ResumenLotesJornada
                                idEvento={evento.id}
                                jornada={jornada}
                                lotes={lotes.filter((l) => l.idJornada === jornada.id)}
                            />
                        </div>
                    ))}
                </div>
            </ContenedorDatos>

            {/* ── PUNTOS DE VENTA: a quién se le entregaron tickets y qué falta rendir ── */}
            {evento.estado !== "Borrador" && <PuntosVentaDelEvento idEvento={evento.id} locales={locales} />}

            {/* ── INFORMES: un evento en Borrador todavía no tiene nada que informar ── */}
            {evento.estado !== "Borrador" && <InformesDelEvento idEvento={evento.id} />}

            {/* ── VENTANAS ─────────────────────────────────────────────────── */}
            {/* El Modal no renderiza nada cerrado: cada vez que se abre, el formulario arranca con los datos actuales */}
            <Modal isOpen={modal === "editar"} closeModal={() => setModal(null)} title="Editar evento">
                <div className="w-[min(90vw,32rem)]">
                    <EventoForm
                        modo="editar"
                        evento={evento}
                        onUpdated={(actualizado) => {
                            // El PUT devuelve solo los datos propios del evento: se mezclan con lo que ya hay
                            setEvento((prev) => (prev ? { ...prev, ...actualizado } : prev));
                            setModal(null);
                        }}
                        onCancel={() => setModal(null)}
                    />
                </div>
            </Modal>

            <AgregarJornadasModal
                isOpen={modal === "agregar"}
                idEvento={evento.id}
                jornadasDelEvento={jornadas}
                onAgregadas={async () => {
                    setModal(null);
                    await recargar();
                }}
                onCancelar={() => setModal(null)}
            />

            <LoteEntradasModal
                isOpen={modal === "entradas"}
                jornadas={conEntradas}
                titulos={titulos}
                onCreado={async () => {
                    setModal(null);
                    // Las entradas nuevas cambian lo que le falta a cada jornada para publicarse
                    await recargar();
                }}
                onCancelar={() => setModal(null)}
            />

            <ConfigurarBoleteriaModal
                isOpen={modal === "boleteria"}
                jornadas={conEntradas}
                titulos={titulos}
                boleterias={lotes.filter((l) => l.esBoleteria)}
                // El modal queda abierto al pausar o quitar: solo se recargan los datos
                onGuardado={recargar}
                onCancelar={() => setModal(null)}
            />

            <PublicarEventoModal
                isOpen={modal === "publicar"}
                estadoEvento={evento.estado}
                revision={revision}
                titulos={titulos}
                // Mientras no se sabe (null) se deja intentar: el backend igual lo controla
                tieneImagen={tieneImagen !== false}
                onConfirmar={async (confirmarIncompletas) => {
                    await publicarEvento(evento.id, confirmarIncompletas);
                    setModal(null);
                    await recargar();
                }}
                onCancelar={() => setModal(null)}
            />

            <ConfirmarAccion
                isOpen={modal === "suspender"}
                title="Suspender jornadas"
                mensaje="Suspender todas las jornadas activas del evento (la venta se corta hasta reprogramar cada una)"
                variante="primary"
                onConfirmar={async () => {
                    await suspenderEvento(evento.id);
                    setModal(null);
                    await recargar();
                }}
                onCancelar={() => setModal(null)}
            />

            <ConfirmarAccion
                isOpen={modal === "finalizar"}
                title="Finalizar evento"
                mensaje={`Finalizar el evento${avisoBorradores} (no se puede deshacer)`}
                onConfirmar={async () => {
                    await finalizarEvento(evento.id, borradores > 0);
                    setModal(null);
                    await recargar();
                }}
                onCancelar={() => setModal(null)}
            />

            <ConfirmarAccion
                isOpen={modal === "cancelar"}
                title="Cancelar evento"
                mensaje={`Cancelar ${cancelables.map((j) => titulos[j.id]).join(", ")} (no se puede deshacer). Los tickets sin vender se anulan y los asignados a locales quedan pendientes de rendición.${paraFinalizar.length > 0 ? ` ${paraFinalizar.map((j) => titulos[j.id]).join(", ")} ${paraFinalizar.length === 1 ? "ya empezó: no se cancela, queda" : "ya empezaron: no se cancelan, quedan"} para finalizar.` : ""} El evento sigue activo: cuando esté todo rendido, finalizalo`}
                onConfirmar={async () => {
                    await cancelarEvento(evento.id);
                    setModal(null);
                    await recargar();
                }}
                onCancelar={() => setModal(null)}
            />

            {/* Finalizar con jornadas sin cierre: el sistema pide resolverlas una por una */}
            <Modal isOpen={modal === "pendientes"} closeModal={() => setModal(null)} title="Antes de finalizar" maxWidth="480px">
                <div className="flex flex-col gap-4 text-sm">
                    <p className="text-gray-700">
                        Estas jornadas todavía no tienen cierre. Finalizalas si ya se realizaron, o cancelalas, y
                        después finalizá el evento:
                    </p>
                    <ul className="flex flex-col gap-2">
                        {abiertas.map((jornada) => (
                            <li key={jornada.id} className="flex items-center justify-between gap-3">
                                <Link
                                    to={RUTAS.eventos.jornada(evento.id, jornada.id)}
                                    className="font-medium text-blue-600 hover:underline"
                                >
                                    {titulos[jornada.id]} ({fechaCortaConDia(jornada.fechaHoraInicio)})
                                </Link>
                                <Etiqueta color={coloresEstadoEvento[jornada.estado]}>{jornada.estado}</Etiqueta>
                            </li>
                        ))}
                    </ul>
                    <Btn variant="outline" onClick={() => setModal(null)}>
                        Entendido
                    </Btn>
                </div>
            </Modal>
        </main>
    );
};

export default EventoPage;
