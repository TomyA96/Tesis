import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CircleCheck } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import type { EventoPendienteDeCierre } from "../../../services/eventosService";

type PanelPendientesCierreProps = {
    eventos: EventoPendienteDeCierre[];
};

/*
    Eventos que ya concluyeron todas sus jornadas y solo falta cerrar, con
    lo que frena el cierre de cada uno. Los criterios son los mismos que usa
    el botón Finalizar (los calcula el backend), así el panel y el botón
    nunca dicen cosas distintas.

    En pantallas grandes el panel va al lado de los cards y toma su alto (absolute
    dentro de un contenedor relative): así los cards marcan la altura de la fila y
    la lista scrollea adentro, en vez de estirarlos.
*/
const PanelPendientesCierre = ({ eventos }: PanelPendientesCierreProps) => (
    <div className="xl:relative">
        <section
            aria-label="Eventos por finalizar"
            className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm xl:absolute xl:inset-0"
        >
            <header className="flex shrink-0 items-center gap-4 border-b border-gray-100 p-5">
                <div className="flex items-center justify-center rounded-xl bg-purple-50 p-3 text-purple-500">
                    <CalendarCheck />
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold leading-none text-gray-900 tabular-nums">{eventos.length}</span>
                    <span className="mt-1 text-sm text-gray-500">Eventos por finalizar</span>
                </div>
            </header>

            {eventos.length === 0 ? (
                <p className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-gray-400">
                    <CircleCheck className="h-4 w-4 text-emerald-500" />
                    Todo al día
                </p>
            ) : (
                // Si hay muchos eventos, la lista scrollea (en pantallas chicas con un alto máximo)
                <ul className="flex max-h-72 min-h-0 flex-1 flex-col divide-y divide-gray-100 overflow-y-auto xl:max-h-none">
                    {eventos.map((evento) => {
                        const listo = evento.jornadasSinFinalizar.length === 0 && evento.ticketsSinRendir.length === 0;
                        return (
                            <li key={evento.id} className="flex flex-col gap-1.5 px-5 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="truncate text-sm font-semibold text-gray-800">{evento.nombre}</span>
                                    <Link
                                        to={RUTAS.eventos.detalle(evento.id)}
                                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                                    >
                                        Ir <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                                <ul className="flex flex-col gap-1 text-xs text-gray-600">
                                    {evento.jornadasSinFinalizar.length > 0 && (
                                        <Pendiente color="bg-amber-500">
                                            Finalizar {evento.jornadasSinFinalizar.map((j) => j.nombre).join(", ")}
                                        </Pendiente>
                                    )}
                                    {evento.ticketsSinRendir.length > 0 && (
                                        <Pendiente color="bg-amber-500">
                                            Rendir: {evento.ticketsSinRendir.map((t) => `${t.puntoVenta.nombre} (${t.cantidad})`).join(", ")}
                                        </Pendiente>
                                    )}
                                    {evento.jornadasBorrador > 0 && (
                                        <Pendiente color="bg-gray-300">
                                            {evento.jornadasBorrador === 1
                                                ? "1 jornada en borrador se descarta al finalizar"
                                                : `${evento.jornadasBorrador} jornadas en borrador se descartan al finalizar`}
                                        </Pendiente>
                                    )}
                                    {listo && (
                                        <li className="flex items-center gap-1.5 font-medium text-emerald-700">
                                            <CircleCheck className="h-3.5 w-3.5" />
                                            Listo para finalizar
                                        </li>
                                    )}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    </div>
);

// Un renglón de la lista: el punto ámbar es lo que frena el cierre, el gris es solo un aviso
const Pendiente = ({ color, children }: { color: string; children: ReactNode }) => (
    <li className="flex items-start gap-2">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
        <span>{children}</span>
    </li>
);

export default PanelPendientesCierre;
