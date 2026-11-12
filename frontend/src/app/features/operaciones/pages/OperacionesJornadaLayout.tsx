import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { RUTAS } from "../../../constantes/Rutas";
import { getJornada, type Jornada } from "../../../services/jornadasService";
import { getEvento } from "../../../services/eventosService";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";
import { estaOperable } from "../utils/ventanaOperacion";

/*
    Envoltorio común de las pantallas que se operan sobre una jornada
    (accesos, venta de entradas y buffet). El id de la jornada viaja en la URL
    (/admin/operaciones/jornadas/:idJornada/...).

    Hace dos cosas: dice SOBRE QUÉ jornada se está trabajando (nombre y fecha,
    para no operar la equivocada) y no deja entrar si la jornada no está
    habilitada, aunque se llegue escribiendo la URL a mano. Ante la duda (si no
    se puede cargar la jornada) tampoco deja pasar.
*/
type ContenidoJornadaProps = {
    idJornada: number;
};

const ContenidoJornada = ({ idJornada }: ContenidoJornadaProps) => {
    const [jornada, setJornada] = useState<Jornada | null>(null);
    const [nombreEvento, setNombreEvento] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getJornada(idJornada)
            .then((respuesta) => {
                setJornada(respuesta);
                // El nombre del evento es solo para mostrar: si falla, no se bloquea nada
                getEvento(respuesta.idEvento)
                    .then((evento) => setNombreEvento(evento?.nombre ?? ""))
                    .catch(() => {});
            })
            .catch(() => setError("No se pudo cargar la jornada"));
    }, [idJornada]);

    const volver = (
        <div className="px-6">
            <LinkBtn variant="outline" size="sm" to={RUTAS.operaciones.inicio} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a operaciones
            </LinkBtn>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                {volver}
                <p className="px-6 text-sm text-red-600">{error}</p>
            </div>
        );
    }
    if (!jornada) {
        return <p className="px-6 text-sm text-gray-500">Cargando jornada…</p>;
    }

    const habilitada = estaOperable(jornada);

    return (
        <div className="flex flex-col gap-4">
            {volver}

            <div className="px-6">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-xl border border-gray-200 bg-white px-5 py-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{nombreEvento}</p>
                        <p className="text-lg font-bold text-gray-900">{jornada.nombre ?? `Jornada #${jornada.id}`}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {fechaArgentina(jornada.fechaHoraInicio)}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {horaArgentina(jornada.fechaHoraInicio)} a {horaArgentina(jornada.fechaHoraFin)} hs
                        </span>
                    </div>
                </div>
            </div>

            {habilitada ? (
                <Outlet />
            ) : (
                <ContenedorDatos className="mx-6 flex flex-col items-center gap-3 p-10 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">Esta jornada no está habilitada para operar</h2>
                    <p className="max-w-md text-sm text-gray-500">
                        {jornada.estado === "Activo"
                            ? "Se puede operar desde 2 horas antes de que empiece hasta 4 horas después de que termine."
                            : `La jornada está en estado ${jornada.estado}.`}
                    </p>
                </ContenedorDatos>
            )}
        </div>
    );
};

/*
    La key hace que, al pasar de una jornada a otra, React arme el contenido de
    cero: así no queda a la vista la jornada anterior mientras carga la nueva.
*/
const OperacionesJornadaLayout = () => {
    const { idJornada } = useParams();
    return <ContenidoJornada key={idJornada} idJornada={Number(idJornada)} />;
};

export default OperacionesJornadaLayout;
