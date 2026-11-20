import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import CargarSolicitudReembolso from "../componentes/CargarSolicitudReembolso";
import SolicitudesReembolso from "../componentes/SolicitudesReembolso";
import { RUTAS } from "../../../constantes/Rutas";
import { coloresEstadoEvento } from "../eventos.columns";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import { getReembolsos, type ReembolsosDeEvento } from "../../../services/reembolsosService";

/*
    Devoluciones de tickets de un evento. Solo de sus jornadas suspendidas o
    canceladas. Arriba, cada una de esas jornadas con lo que queda por
    resolver; en el medio, cargar la solicitud de alguien que se presenta
    con su ticket; abajo, las solicitudes (las de las ventas online de una
    jornada cancelada se generan solas) para aprobarlas o rechazarlas.
*/
const ReembolsosPage = () => {
    const { idEvento } = useParams();
    const id = Number(idEvento);
    const [datos, setDatos] = useState<ReembolsosDeEvento | null>(null);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");

    const cargar = useCallback(async () => {
        try {
            setDatos(await getReembolsos(id));
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar los reembolsos");
        }
    }, [id]);

    useEffect(() => {
        setDatos(null);
        setAviso("");
        cargar();
    }, [cargar]);

    if (error && !datos) {
        return (
            <main className="px-8">
                <p role="alert" className="text-sm text-red-600">{error}</p>
            </main>
        );
    }
    if (!datos || datos.evento.id !== id) {
        return (
            <main className="px-8">
                <p className="text-sm text-gray-500">Cargando…</p>
            </main>
        );
    }

    const conCambio = async (texto: string) => {
        setAviso(texto);
        await cargar();
    };

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                volver={{ to: RUTAS.eventos.detalle(datos.evento.id), label: datos.evento.nombre }}
                icono={<CalendarDays />}
                seccion="Eventos"
                titulo="Reembolsos"
                detalle="Devolución de tickets de las jornadas suspendidas o canceladas"
            />

            {aviso && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{aviso}</p>}

            {datos.jornadas.length === 0 ? (
                <ContenedorDatos className="p-10 text-center">
                    <p className="font-semibold text-gray-800">No hay jornadas suspendidas ni canceladas</p>
                    <p className="mt-1 text-sm text-gray-500">Solo se devuelven tickets de jornadas que no se hicieron en su fecha.</p>
                </ContenedorDatos>
            ) : (
                <>
                    {/* ── JORNADAS CON DEVOLUCIONES ─────────────────────────────── */}
                    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {datos.jornadas.map((j) => (
                            <ContenedorDatos key={j.id} className="gap-2 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-gray-900">
                                        {j.nombre ?? "Jornada"} <span className="font-normal text-gray-500">{fechaCortaConDia(j.fechaHoraInicio)}</span>
                                    </span>
                                    <Etiqueta color={coloresEstadoEvento[j.estado]}>{j.estado}</Etiqueta>
                                </div>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <dt className="text-gray-500">Pendientes</dt>
                                    <dd className="text-right font-semibold text-amber-700">
                                        {j.pendientes} · {formatPrecio(Number(j.montoPendiente))}
                                    </dd>
                                    <dt className="text-gray-500">Aprobadas</dt>
                                    <dd className="text-right font-semibold text-gray-800">{j.aprobadas}</dd>
                                    <dt className="text-gray-500">Rechazadas</dt>
                                    <dd className="text-right font-semibold text-gray-800">{j.rechazadas}</dd>
                                    <dt className="text-gray-500">Vendidos sin solicitud</dt>
                                    <dd className="text-right font-semibold text-gray-800">{j.sinSolicitud}</dd>
                                </dl>
                            </ContenedorDatos>
                        ))}
                    </section>

                    {/* ── CARGAR UNA SOLICITUD ─────────────────────────────────── */}
                    <ContenedorDatos>
                        <Header titulo="Cargar solicitud" />
                        <p className="px-6 pt-3 text-sm text-gray-500">
                            Para quien se presenta con su ticket (o pide la devolución de una compra online). Las ventas online
                            de una jornada cancelada ya quedan pendientes solas.
                        </p>
                        <CargarSolicitudReembolso
                            idEvento={datos.evento.id}
                            jornadas={datos.jornadas}
                            onRegistradas={(n) => conCambio(`${n} ${n === 1 ? "solicitud cargada" : "solicitudes cargadas"}: quedan pendientes de aprobación`)}
                        />
                    </ContenedorDatos>
                </>
            )}

            {/* ── SOLICITUDES (también el historial si ya no quedan jornadas así) ── */}
            {(datos.jornadas.length > 0 || datos.solicitudes.length > 0) && (
                <ContenedorDatos>
                    <Header titulo="Solicitudes" />
                    <SolicitudesReembolso idEvento={datos.evento.id} solicitudes={datos.solicitudes} onCambio={conCambio} />
                </ContenedorDatos>
            )}
        </main>
    );
};

export default ReembolsosPage;
