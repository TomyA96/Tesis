import { useEffect, useMemo, useState } from "react";
import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import CardEvent from "../../administracion/componentes/CardEvent";
import { RUTAS } from "../../../constantes/Rutas";
import { getEventosPublicados, type Evento } from "../../../services/eventosService";
import type { Jornada } from "../../../services/jornadasService";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";
import { fechaAInputs } from "../../eventos/utils/fechaHora";

type EventoConJornadasActivas = {
    evento: Evento;
    jornadas: Jornada[];
    // Alguna de sus jornadas es de hoy o está en curso
    tieneHoy: boolean;
};

/*
    Una jornada es "de hoy" si empieza hoy o ya está en curso (una que arrancó
    anoche a las 22:00 y termina a las 03:00 sigue siendo la de esta noche).
    El día se compara en hora argentina, no en la de la computadora.
*/
const esDeHoy = (jornada: Jornada, ahora: Date) => {
    const inicio = new Date(jornada.fechaHoraInicio);
    const fin = new Date(jornada.fechaHoraFin);
    const empiezaHoy = fechaAInputs(inicio).fecha === fechaAInputs(ahora).fecha;
    const enCurso = inicio <= ahora && ahora <= fin;
    return empiezaHoy || enCurso;
};

const OperacionesHomePage = () => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEventosPublicados()
            .then((response) => setEventos(response))
            .catch(() => setError("No se pudieron cargar los eventos"))
            .finally(() => setCargando(false));
    }, []);

    /*
        Solo se opera sobre jornadas Activas: una Borrador todavía no se
        vende, y una Suspendida, Finalizada o Cancelada ya no tiene nada para
        operar. Los eventos con alguna jornada de hoy van primero; el resto,
        por fecha de inicio.
    */
    const grupos = useMemo<EventoConJornadasActivas[]>(() => {
        const ahora = new Date();
        return eventos
            .map((evento) => {
                const jornadas = evento.jornadas.filter((jornada) => jornada.estado === "Activo");
                return { evento, jornadas, tieneHoy: jornadas.some((jornada) => esDeHoy(jornada, ahora)) };
            })
            .filter((grupo) => grupo.jornadas.length > 0)
            .sort((a, b) => {
                if (a.tieneHoy !== b.tieneHoy) return a.tieneHoy ? -1 : 1;
                return new Date(a.jornadas[0].fechaHoraInicio).getTime() - new Date(b.jornadas[0].fechaHoraInicio).getTime();
            });
    }, [eventos]);

    const ahora = new Date();

    return (
        <main>
            <ContenedorDatos>
                <Header
                    titulo={<span className="text-2xl font-semibold text-gray-800">Operaciones</span>}
                />

                <div className="flex flex-col gap-8 p-6">
                    <p className="text-sm text-gray-500">
                        Elegí la jornada sobre la que vas a trabajar: controlar los accesos, vender entradas en
                        la puerta o atender el buffet.
                    </p>

                    {cargando && <p className="text-sm text-gray-500">Cargando jornadas…</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {!cargando && !error && grupos.length === 0 && (
                        <p className="text-center text-gray-500">No hay jornadas activas para operar.</p>
                    )}

                    {grupos.map(({ evento, jornadas }) => (
                        <section key={evento.id} className="flex flex-col gap-4">
                            <h2 className="border-l-4 border-blue-500 pl-3 text-lg font-semibold text-gray-800">
                                {evento.nombre}
                            </h2>

                            <div className="flex flex-wrap gap-6">
                                {jornadas.map((jornada, indice) => {
                                    const hora = horaArgentina(jornada.fechaHoraInicio);
                                    return (
                                        <CardEvent
                                            key={jornada.id}
                                            nombre={jornada.nombre ?? `Jornada ${indice + 1}`}
                                            fecha={
                                                esDeHoy(jornada, ahora)
                                                    ? `Hoy, ${hora} hs`
                                                    : `${fechaArgentina(jornada.fechaHoraInicio)} ${hora} hs`
                                            }
                                            estado={jornada.estado}
                                            acciones={
                                                <div className="flex flex-col gap-2">
                                                    <LinkBtn variant="primary" size="sm" className="w-full" to={RUTAS.operaciones.accesos(jornada.id)}>
                                                        Control de accesos
                                                    </LinkBtn>
                                                    <LinkBtn variant="outline" size="sm" className="w-full" to={RUTAS.operaciones.ventaEntradas(jornada.id)}>
                                                        Venta de entradas
                                                    </LinkBtn>
                                                    <LinkBtn variant="outline" size="sm" className="w-full" to={RUTAS.operaciones.buffet(jornada.id)}>
                                                        Buffet
                                                    </LinkBtn>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </ContenedorDatos>
        </main>
    );
};

export default OperacionesHomePage;
