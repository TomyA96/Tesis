import { useEffect, useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import CardJornadaOperacion from "../componentes/CardJornadaOperacion";
import { ACCIONES_OPERACION } from "../operaciones.config";
import { estaOperable, momentoDeJornada } from "../utils/ventanaOperacion";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../services/api";
import { getEventosPublicados, type Evento } from "../../../services/eventosService";
import { buscarImagenesPorEvento } from "../../../services/imagenEventoService";
import type { Jornada } from "../../../services/jornadasService";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";

type JornadaOperable = {
    jornada: Jornada;
    evento: Evento;
    // Posición dentro de su evento, para el nombre cuando la jornada no tiene uno
    numero: number;
};

const OperacionesHomePage = () => {
    const { permisos, puede } = useAuth();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [imagenes, setImagenes] = useState<Record<number, string>>({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEventosPublicados()
            .then((response) => setEventos(response))
            .catch(() => setError("No se pudieron cargar las jornadas"))
            .finally(() => setCargando(false));
    }, []);

    // Lo que este usuario puede hacer: de acá salen los botones de cada card
    const acciones = useMemo(
        () => ACCIONES_OPERACION.filter((accion) => puede(accion.permiso)),
        // puede cambia en cada render, pero su resultado solo depende de los permisos
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [permisos],
    );

    /*
        Solo las jornadas que se pueden operar ahora (Activas y dentro de la
        ventana: ver ventanaOperacion). Las que están en curso van primero, el
        resto por hora de inicio. La condición es de la jornada, no del
        evento: el Día 3 de un festival no se opera el Día 1.
    */
    const operables = useMemo<JornadaOperable[]>(() => {
        const ahora = new Date();
        return eventos
            .flatMap((evento) =>
                evento.jornadas.map((jornada, indice) => ({ jornada, evento, numero: indice + 1 })),
            )
            .filter(({ jornada }) => estaOperable(jornada, ahora))
            .sort((a, b) => {
                const aEnCurso = momentoDeJornada(a.jornada, ahora) === "en-curso";
                const bEnCurso = momentoDeJornada(b.jornada, ahora) === "en-curso";
                if (aEnCurso !== bEnCurso) return aEnCurso ? -1 : 1;
                return new Date(a.jornada.fechaHoraInicio).getTime() - new Date(b.jornada.fechaHoraInicio).getTime();
            });
    }, [eventos]);

    // Una imagen por evento (no por card): varias jornadas del mismo festival la comparten
    const idsEventos = useMemo(
        () => [...new Set(operables.map(({ evento }) => evento.id))].join(","),
        [operables],
    );
    useEffect(() => {
        if (!idsEventos) return;
        idsEventos.split(",").forEach((id) => {
            buscarImagenesPorEvento(Number(id))
                .then((response) => {
                    if (response[0]) setImagenes((prev) => ({ ...prev, [Number(id)]: `${API_URL}${response[0].url}` }));
                })
                // Sin imagen la card igual funciona: queda el fondo liso
                .catch(() => {});
        });
    }, [idsEventos]);

    const ahora = new Date();

    const contenido = () => {
        if (cargando || permisos === null) {
            return <p className="text-sm text-gray-500">Cargando jornadas…</p>;
        }
        if (error) {
            return <p className="text-sm text-red-600">{error}</p>;
        }
        if (acciones.length === 0) {
            return (
                <p className="py-10 text-center text-gray-500">
                    Tu perfil no tiene permisos para operar. Si lo necesitás para trabajar, pedíselo al administrador.
                </p>
            );
        }
        if (operables.length === 0) {
            return (
                <p className="py-10 text-center text-gray-500">
                    No hay jornadas para operar en este momento. Aparecen 2 horas antes de empezar y hasta 4 horas
                    después de terminar.
                </p>
            );
        }
        return (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {operables.map(({ jornada, evento, numero }) => (
                    <CardJornadaOperacion
                        key={jornada.id}
                        idJornada={jornada.id}
                        nombreEvento={evento.nombre}
                        nombreJornada={jornada.nombre ?? `Jornada ${numero}`}
                        imagenUrl={imagenes[evento.id]}
                        fecha={fechaArgentina(jornada.fechaHoraInicio)}
                        horario={`${horaArgentina(jornada.fechaHoraInicio)} a ${horaArgentina(jornada.fechaHoraFin)} hs`}
                        momento={momentoDeJornada(jornada, ahora)}
                        acciones={acciones}
                    />
                ))}
            </div>
        );
    };

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina icono={<Wrench />} seccion="Operaciones" titulo="Elegí una jornada" />
            <ContenedorDatos>
                <div className="flex flex-col gap-6 p-6">
                    {contenido()}
                </div>
            </ContenedorDatos>
        </main>
    );
};

export default OperacionesHomePage;
