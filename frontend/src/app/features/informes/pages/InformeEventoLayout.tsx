import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { ArrowLeft, BarChart2 } from "lucide-react";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import EncabezadoPagina from "../../../ui/componentes/EncabezadoPagina";
import TabsInformeEvento from "../componentes/TabsInformeEvento";
import { coloresEstadoEvento } from "../../eventos/eventos.columns";
import { RUTAS } from "../../../constantes/Rutas";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import { getInformeEvento, type InformeEvento } from "../../../services/informesService";
import type { ContextoInformeEvento } from "../informeEvento";

/*
    Marco del informe de un evento: el link para volver, la cabecera con los
    datos del evento y las pestañas. Pide el informe una sola vez y se lo pasa
    a la pestaña que esté abierta (Outlet), junto con la jornada elegida: así
    cambiar de pestaña o de jornada no vuelve a pedir nada al backend.
*/
const InformeEventoLayout = () => {
    const { idEvento } = useParams();
    const [informe, setInforme] = useState<InformeEvento | null>(null);
    const [idJornada, setIdJornada] = useState<number | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!idEvento) return;
        let vigente = true;
        setInforme(null);
        setIdJornada(null);
        setError("");
        getInformeEvento(idEvento)
            .then((datos) => vigente && setInforme(datos))
            .catch((e: Error) => vigente && setError(e.message));
        return () => {
            vigente = false;
        };
    }, [idEvento]);

    const volver = (
        <Link to={RUTAS.informes.inicio} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" />
            Resumen anual
        </Link>
    );

    if (error || !informe) {
        return (
            <main className="flex flex-col gap-4 px-6 pb-8">
                {volver}
                <p className={error ? "rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700" : "py-12 text-center text-sm text-gray-400"}>
                    {error ? `No se pudo cargar el informe: ${error}` : "Cargando…"}
                </p>
            </main>
        );
    }

    const { evento, jornadas } = informe;
    // Si empieza y termina el mismo día, "del sáb 19/9 al sáb 19/9" sobra
    const fechas =
        evento.fechaInicio && evento.fechaFin
            ? fechaCortaConDia(evento.fechaInicio) === fechaCortaConDia(evento.fechaFin)
                ? fechaCortaConDia(evento.fechaInicio)
                : `del ${fechaCortaConDia(evento.fechaInicio)} al ${fechaCortaConDia(evento.fechaFin)}`
            : null;
    const datos = [
        fechas,
        evento.direcciones.join(" / "),
        `${jornadas.length} ${jornadas.length === 1 ? "jornada" : "jornadas"}`,
        `capacidad ${evento.capacidad.toLocaleString("es-AR")}`,
    ].filter(Boolean);

    const contexto: ContextoInformeEvento = { informe, idJornada, setIdJornada };

    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                volver={{ to: RUTAS.informes.inicio, label: "Resumen anual" }}
                icono={<BarChart2 />}
                seccion="Informes"
                titulo={evento.nombre}
                etiqueta={<Etiqueta color={coloresEstadoEvento[evento.estado]}>{evento.estado}</Etiqueta>}
                detalle={datos.join(" · ")}
            />

            <TabsInformeEvento />

            <Outlet context={contexto} />
        </main>
    );
};

export default InformeEventoLayout;
