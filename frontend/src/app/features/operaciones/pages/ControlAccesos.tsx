import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { CircleAlert, CircleCheck, CircleX, ScanLine } from "lucide-react";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Btn from "../../../ui/componentes/Btn";
import { cn } from "../../../../lib/cn";
import { horaArgentina } from "../../../utils/zonaHoraria";
import {
    getAccesos,
    getResumenAccesos,
    registrarAcceso,
    type Acceso,
    type ResumenAccesos,
} from "../../../services/accesosService";

// Cuánto queda a la vista el resultado de un escaneo antes de limpiarse para el siguiente
const SEGUNDOS_RESULTADO = 4;

type Resultado =
    | { tipo: "pasa"; titulo: string; detalle: string }
    | { tipo: "advertencia"; titulo: string; detalle: string }
    | { tipo: "rechazo"; titulo: string; detalle: string };

const estilos: Record<Resultado["tipo"], { caja: string; icono: React.ReactNode }> = {
    pasa: { caja: "border-emerald-200 bg-emerald-50 text-emerald-900", icono: <CircleCheck className="h-10 w-10 text-emerald-600" /> },
    advertencia: { caja: "border-amber-200 bg-amber-50 text-amber-900", icono: <CircleAlert className="h-10 w-10 text-amber-500" /> },
    rechazo: { caja: "border-red-200 bg-red-50 text-red-900", icono: <CircleX className="h-10 w-10 text-red-600" /> },
};

/*
    La pantalla de la puerta. Primera versión: el código se ingresa en un
    campo de texto. Así funciona con un lector de QR USB o Bluetooth (que
    "escribe" el código y aprieta Enter, como un teclado) y también para
    probar pegando el código a mano. La cámara del celular queda para después.

    El campo vuelve a tomar el foco después de cada lectura: el portero no
    tiene que tocar la pantalla entre una entrada y la siguiente.

    El resultado se muestra grande y por color, para leerlo de un vistazo:
    verde pasa, amarillo pasa pero sin venta registrada, rojo no pasa (con el
    motivo que da el backend).
*/
const ControlAccesos = () => {
    const { idJornada } = useParams();
    const id = Number(idJornada);

    const [codigo, setCodigo] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [resumen, setResumen] = useState<ResumenAccesos | null>(null);
    const [ultimos, setUltimos] = useState<Acceso[]>([]);
    const [error, setError] = useState("");
    const campo = useRef<HTMLInputElement>(null);

    const recargar = useCallback(async () => {
        try {
            const [nuevoResumen, nuevosAccesos] = await Promise.all([getResumenAccesos(id), getAccesos(id)]);
            setResumen(nuevoResumen);
            setUltimos(nuevosAccesos);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar los ingresos");
        }
    }, [id]);

    useEffect(() => {
        recargar();
    }, [recargar]);

    // El resultado se limpia solo; si llega otro escaneo antes, el temporizador vuelve a empezar
    useEffect(() => {
        if (!resultado) return;
        const temporizador = window.setTimeout(() => setResultado(null), SEGUNDOS_RESULTADO * 1000);
        return () => window.clearTimeout(temporizador);
    }, [resultado]);

    const registrar = async (e: FormEvent) => {
        e.preventDefault();
        const leido = codigo.trim();
        if (!leido || enviando) return;

        setEnviando(true);
        try {
            const ingreso = await registrarAcceso(id, leido);
            const detalle = `${ingreso.ticket.entrada} · N° ${ingreso.ticket.numero}`;
            setResultado(
                ingreso.advertencia
                    ? { tipo: "advertencia", titulo: "Puede pasar", detalle: `${detalle} — ${ingreso.advertencia}` }
                    : { tipo: "pasa", titulo: "Puede pasar", detalle },
            );
            recargar();
        } catch (err) {
            setResultado({
                tipo: "rechazo",
                titulo: "No puede pasar",
                detalle: err instanceof Error ? err.message : "No se pudo registrar el ingreso",
            });
        } finally {
            setCodigo("");
            setEnviando(false);
            campo.current?.focus();
        }
    };

    const porcentaje = resumen && resumen.capacidad > 0 ? Math.min(100, Math.round((resumen.ingresaron / resumen.capacidad) * 100)) : 0;

    return (
        <div className="grid items-start gap-6 px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* ── LECTURA Y RESULTADO ─────────────────────────────────────── */}
            <ContenedorDatos className="gap-5 p-6">
                <form onSubmit={registrar} className="flex flex-col gap-2">
                    <label htmlFor="codigo-acceso" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <ScanLine className="h-4 w-4 text-slate-400" />
                        Escaneá el QR o ingresá el código
                    </label>
                    <div className="flex gap-3">
                        <input
                            ref={campo}
                            id="codigo-acceso"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="Código del ticket"
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 font-mono text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <Btn type="submit" size="lg" disabled={enviando || !codigo.trim()}>
                            Registrar
                        </Btn>
                    </div>
                </form>

                <div
                    role="status"
                    aria-live="assertive"
                    className={cn(
                        "flex min-h-32 items-center gap-4 rounded-2xl border p-6 transition-colors",
                        resultado ? estilos[resultado.tipo].caja : "border-dashed border-gray-200 text-gray-400",
                    )}
                >
                    {resultado ? (
                        <>
                            {estilos[resultado.tipo].icono}
                            <div className="flex flex-col gap-1">
                                <span className="text-2xl font-bold uppercase tracking-wide">{resultado.titulo}</span>
                                <span className="text-base">{resultado.detalle}</span>
                            </div>
                        </>
                    ) : (
                        <span className="w-full text-center text-sm">Esperando el próximo ticket…</span>
                    )}
                </div>

                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            </ContenedorDatos>

            {/* ── CONTADOR Y ÚLTIMOS INGRESOS ─────────────────────────────── */}
            <ContenedorDatos className="gap-0">
                <div className="flex flex-col gap-2 border-b border-gray-100 p-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ingresaron</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums text-gray-900">{resumen?.ingresaron ?? "—"}</span>
                        {resumen && <span className="text-sm text-gray-500">de {resumen.capacidad} de capacidad</span>}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${porcentaje}%` }} />
                    </div>
                </div>

                <div className="flex flex-col p-5">
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Últimos ingresos</span>
                    {ultimos.length === 0 ? (
                        <p className="py-4 text-sm text-gray-400">Todavía no ingresó nadie.</p>
                    ) : (
                        <ul className="flex max-h-96 flex-col divide-y divide-gray-100 overflow-y-auto text-sm">
                            {ultimos.map((acceso) => (
                                <li key={acceso.id} className="flex items-center justify-between gap-3 py-2">
                                    <span className="text-gray-800">
                                        {acceso.ticket.entrada.descripcion} · N° {acceso.ticket.numero}
                                    </span>
                                    <span className="shrink-0 text-xs text-gray-500" title={`Registró ${acceso.usuario.nombre}`}>
                                        {horaArgentina(acceso.fechaHora)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </ContenedorDatos>
        </div>
    );
};

export default ControlAccesos;
