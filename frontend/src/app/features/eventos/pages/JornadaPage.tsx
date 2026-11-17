import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LinkVolver } from "../../../ui/componentes/EncabezadoPagina";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import Header from "../../../ui/componentes/Header";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import JornadaForm from "../forms/JornadaForm";
import ListaEntradas from "../componentes/ListaEntradas";
import ReprogramarModal from "../modales/ReprogramarModal";
import { RUTAS } from "../../../constantes/Rutas";
import {
  getEvento,
  getRevisionPublicacion,
  type Evento,
} from "../../../services/eventosService";
import {
  cancelarJornada,
  deleteJornada,
  finalizarJornada,
  publicarJornada,
  suspenderJornada,
} from "../../../services/jornadasService";
import {
  getEntradasDeJornada,
  type Entrada,
} from "../../../services/entradasService";
import { coloresEstadoEvento } from "../eventos.columns";
import { nombreJornada } from "../utils/jornadaForm";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";

// Las acciones que piden confirmación (reprogramar tiene su propio modal con formulario)
type AccionJornada =
  "publicar" | "suspender" | "finalizar" | "cancelar" | "eliminar";

/*
    La pantalla de una jornada: sus datos (ver y editar), lo que le falta para
    publicarse, sus entradas y las acciones que permite su estado.

    La jornada se saca del evento (que ya trae todas, ordenadas) en vez de
    pedirla sola: así también sabemos el estado del evento y el número de
    "Jornada N", sin otra llamada.
*/
const JornadaPage = () => {
  const { idEvento, idJornada } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(false);
  const [accion, setAccion] = useState<AccionJornada | null>(null);
  const [reprogramando, setReprogramando] = useState(false);
  // Cambia en cada recarga: es la key del formulario, para que se monte con los datos nuevos
  const [version, setVersion] = useState(0);

  const cargar = useCallback(async (idEv: number, idJor: number) => {
    const [eventoBuscado, revision, entradasBuscadas] = await Promise.all([
      getEvento(idEv),
      // Sin revisión la pantalla sirve igual: solo no muestra lo que falta
      getRevisionPublicacion(idEv).catch(() => []),
      getEntradasDeJornada(idJor),
    ]);
    setEvento(eventoBuscado);
    setFaltantes(revision.find((r) => r.id === idJor)?.faltantes ?? []);
    setEntradas(entradasBuscadas);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    setEvento(null);
    setEditando(false);
    setAccion(null);
    setError("");
    cargar(Number(idEvento), Number(idJornada)).catch(() =>
      setError("No se pudo cargar la jornada"),
    );
  }, [idEvento, idJornada, cargar]);

  const recargar = () => cargar(Number(idEvento), Number(idJornada));

  if (error) {
    return (
      <main className="px-8">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  const indice =
    evento?.jornadas.findIndex((j) => j.id === Number(idJornada)) ?? -1;
  const jornada = evento?.jornadas[indice];

  if (!evento || evento.id !== Number(idEvento)) {
    return (
      <main className="px-8">
        <p className="text-sm text-gray-500">Cargando jornada…</p>
      </main>
    );
  }
  // El evento existe pero esa jornada no es suya (o ya no existe)
  if (!jornada) {
    return (
      <main className="px-8">
        <p className="text-sm text-red-600">
          La jornada no existe en este evento.
        </p>
      </main>
    );
  }

  const titulo = nombreJornada(jornada, indice);
  const { estado } = jornada;
  // Se calcula en cada render: al recargar la pantalla después de la hora de inicio, ya cuenta como en curso
  const enCurso = new Date(jornada.fechaHoraInicio) <= new Date();

  const puedeEditar =
    estado === "Borrador" || estado === "Activo" || estado === "Suspendido";
  // Una jornada suelta solo se publica con el evento ya Activo; antes, se publica desde el evento
  const puedePublicar = estado === "Borrador" && evento.estado === "Activo";
  // El backend no deja quitar la última jornada: para eso se elimina el evento
  const puedeEliminar = estado === "Borrador" && evento.jornadas.length > 1;

  // Lo que dice y hace cada confirmación. ConfirmarAccion envuelve el mensaje en "¿...?"
  const confirmaciones: Record<
    AccionJornada,
    { titulo: string; mensaje: string; ejecutar: () => Promise<unknown> }
  > = {
    publicar: {
      titulo: "Publicar jornada",
      mensaje:
        "Publicar la jornada (se crean los tickets de sus lotes online y quedan a la venta; los lotes físicos se imprimen aparte)",
      ejecutar: () => publicarJornada(jornada.id),
    },
    suspender: {
      titulo: "Suspender jornada",
      mensaje: "Suspender la jornada (la venta se corta hasta reprogramarla)",
      ejecutar: () => suspenderJornada(jornada.id),
    },
    finalizar: {
      titulo: "Finalizar jornada",
      mensaje:
        "Marcar la jornada como realizada (se anulan los tickets online sin vender y los impresos que están en mano; los asignados a locales quedan pendientes de su rendición; no se puede deshacer)",
      ejecutar: () => finalizarJornada(jornada.id),
    },
    cancelar: {
      titulo: "Cancelar jornada",
      mensaje:
        "Cancelar la jornada (se anulan los tickets online sin vender y los impresos que están en mano; los asignados a locales quedan pendientes de su rendición; no se puede deshacer)",
      ejecutar: () => cancelarJornada(jornada.id),
    },
    eliminar: {
      titulo: "Eliminar jornada",
      mensaje: "Eliminar la jornada y sus entradas (no se puede deshacer)",
      ejecutar: () => deleteJornada(jornada.id),
    },
  };

  const confirmar = async () => {
    if (!accion) return;
    await confirmaciones[accion].ejecutar();
    setAccion(null);
    // Eliminada ya no hay jornada para mostrar: se vuelve al evento
    if (accion === "eliminar") {
      navigate(RUTAS.eventos.detalle(evento.id));
      return;
    }
    await recargar();
  };

  return (
    /*
            Dos columnas en PC (se apilan en pantallas chicas): a la izquierda
            la cabecera y los datos de la jornada, con un ancho acotado para
            que los inputs no se estiren; a la derecha las entradas, que es lo
            que más espacio necesita.
        */
    <main className="flex flex-col gap-6 px-6 pb-8">
    <LinkVolver to={RUTAS.eventos.detalle(evento.id)} label={evento.nombre} />
    <div className="grid items-start gap-4 lg:grid-cols-[26rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        {/* ── CABECERA: misma caja y mismo título que EncabezadoPagina ─── */}
        <ContenedorDatos className="gap-3 border border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Eventos · Jornada</p>

          {/*
              A la izquierda el título, la fecha y Editar (que es sobre los
              datos); a la derecha, una debajo de otra, las acciones que
              cambian el estado de la jornada.
          */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{titulo}</h1>
                  <Etiqueta color={coloresEstadoEvento[estado]}>
                    {estado}
                  </Etiqueta>
                </div>
                <span className="text-sm text-gray-500">
                  {fechaCortaConDia(jornada.fechaHoraInicio)}
                </span>
              </div>

              {puedeEditar && !editando && (
                <Btn
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setEditando(true)}
                >
                  Editar
                </Btn>
              )}
            </div>

            <div className="flex w-28 shrink-0 flex-col gap-2 empty:hidden">
              {puedePublicar && (
                <Btn
                  variant="success"
                  size="sm"
                  disabled={faltantes.length > 0}
                  title={
                    faltantes.length > 0
                      ? "Completá lo que falta para poder publicarla"
                      : undefined
                  }
                  onClick={() => setAccion("publicar")}
                >
                  Publicar
                </Btn>
              )}
              {estado === "Activo" && (
                <Btn
                  variant="warning"
                  size="sm"
                  onClick={() => setAccion("suspender")}
                >
                  Suspender
                </Btn>
              )}
              {estado === "Suspendido" && (
                <Btn size="sm" onClick={() => setReprogramando(true)}>
                  Reprogramar
                </Btn>
              )}
              {/*
                Finalizar es "ya se realizó": solo aparece desde su hora de
                inicio, también suspendida (se cortó y no se retoma). Cancelar
                es lo contrario: solo antes de que empiece, o ya suspendida.
                Una jornada en curso no se cancela: primero se suspende. El
                backend aplica las mismas reglas.
              */}
              {(estado === "Activo" || estado === "Suspendido") && enCurso && (
                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={() => setAccion("finalizar")}
                >
                  Finalizar
                </Btn>
              )}
              {((estado === "Activo" && !enCurso) || estado === "Suspendido") && (
                <Btn
                  variant="danger"
                  size="sm"
                  onClick={() => setAccion("cancelar")}
                >
                  Cancelar
                </Btn>
              )}
              {puedeEliminar && (
                <Btn
                  variant="danger"
                  size="sm"
                  onClick={() => setAccion("eliminar")}
                >
                  Eliminar
                </Btn>
              )}
            </div>
          </div>

          {/* Qué le falta para publicarse: solo tiene sentido mientras está en Borrador */}
          {estado === "Borrador" && (
            <div
              className={
                faltantes.length > 0
                  ? "rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  : "rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              }
            >
              {faltantes.length > 0 ? (
                <>
                  <span className="font-medium">Para publicarla falta:</span>
                  <ul className="mt-1 list-inside list-disc">
                    {faltantes.map((faltante) => (
                      <li key={faltante}>{faltante}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <span className="font-medium">
                  Está completa y lista para publicarse.
                </span>
              )}
              {evento.estado === "Borrador" && (
                <p className="mt-1 text-xs">
                  Se publica junto con el evento, con el botón «Publicar» de la
                  pantalla del evento.
                </p>
              )}
            </div>
          )}
        </ContenedorDatos>

        {/* ── DATOS ────────────────────────────────────────────────────── */}
        <ContenedorDatos>
          <Header titulo="Datos de la jornada" />
          <div className="p-6">
            <JornadaForm
              // Con cada recarga o al salir de editar se monta de nuevo, con los datos guardados
              key={`${jornada.id}-${version}-${editando}`}
              modo={editando ? "editar" : "ver"}
              idEvento={evento.id}
              jornada={jornada}
              onCreated={() => {}}
              onUpdated={async () => {
                setEditando(false);
                await recargar();
              }}
              onCancel={() => setEditando(false)}
            />
          </div>
        </ContenedorDatos>
      </div>

      {/* ── ENTRADAS (columna derecha) ───────────────────────────────── */}
      <ListaEntradas
        entradas={entradas}
        estadoEvento={estado}
        idEvento={evento.id}
        idJornada={jornada.id}
        capacidad={jornada.capacidad}
        // Una entrada nueva puede cambiar lo que falta para publicar: se recarga todo
        onEntradaGuardada={recargar}
      />

      {/* ── VENTANAS ─────────────────────────────────────────────────── */}
      {accion && (
        <ConfirmarAccion
          isOpen
          title={confirmaciones[accion].titulo}
          mensaje={confirmaciones[accion].mensaje}
          variante={accion === "publicar" ? "primary" : "danger"}
          onConfirmar={confirmar}
          onCancelar={() => setAccion(null)}
        />
      )}

      <ReprogramarModal
        isOpen={reprogramando}
        jornada={jornada}
        closeModal={() => setReprogramando(false)}
        onReprogramado={async () => {
          setReprogramando(false);
          await recargar();
        }}
      />
    </div>
    </main>
  );
};

export default JornadaPage;
