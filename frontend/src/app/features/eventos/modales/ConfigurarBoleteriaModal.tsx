import { useState } from "react";
import Modal from "../../../ui/componentes/Modal";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import {
    configurarBoleteria,
    deleteEntrada,
    deshabilitarEntrada,
    habilitarEntrada,
    type Entrada,
} from "../../../services/entradasService";
import type { Jornada } from "../../../services/jornadasService";
import { coloresEstadoEvento } from "../eventos.columns";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import { formatPrecio } from "../../../utils/formatoPrecio";

type ConfigurarBoleteriaModalProps = {
    isOpen: boolean;
    // Solo las que pueden recibir entradas (ni finalizadas ni canceladas), en orden
    jornadas: Jornada[];
    // Nombre a mostrar de cada jornada, por id ("Jornada N" si no tiene)
    titulos: Record<number, string>;
    // Las boleterías que ya existen en el evento (una por jornada como mucho)
    boleterias: Entrada[];
    // Después de cada cambio (recargar los datos del evento); el modal se cierra solo al guardar el precio
    onGuardado: () => void | Promise<void>;
    onCancelar: () => void;
};

/*
    La venta en puerta de cada jornada: un solo tipo de entrada, «General
    Boletería», con nombre fijo (lo pone el sistema). Acá solo se elige el
    precio y en qué jornadas, todas juntas o una por una, como un lote. Si
    una jornada ya tiene boletería, guardar le cambia el precio: lo ya
    vendido conserva el precio que se cobró.

    Desde la misma lista se pausa o se quita la de una jornada. Quitarla
    solo se puede si nunca vendió nada; si vendió, se pausa.
*/
const ConfigurarBoleteriaModal = ({ isOpen, jornadas, titulos, boleterias, onGuardado, onCancelar }: ConfigurarBoleteriaModalProps) => {
    const boleteriaDe = new Map(boleterias.map((b) => [b.idJornada, b]));
    // Si todas las existentes tienen el mismo precio, se propone ese
    const preciosActuales = [...new Set(boleterias.map((b) => Number(b.precio)))];
    const precioSugerido = preciosActuales.length === 1 ? String(preciosActuales[0]) : "";

    const [precio, setPrecio] = useState<string | null>(null);
    // Se guardan las DESTILDADAS: todas arrancan marcadas
    const [excluidas, setExcluidas] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const precioEscrito = precio ?? precioSugerido;
    const elegidas = jornadas.filter((jornada) => !excluidas.includes(jornada.id));
    const nuevas = elegidas.filter((jornada) => !boleteriaDe.has(jornada.id)).length;

    const alternar = (idJornada: number) => {
        setExcluidas((prev) => (prev.includes(idJornada) ? prev.filter((id) => id !== idJornada) : [...prev, idJornada]));
        setError("");
    };

    const elegirTodas = (todas: boolean) => {
        setExcluidas(todas ? [] : jornadas.map((jornada) => jornada.id));
        setError("");
    };

    const cerrar = () => {
        setPrecio(null);
        setExcluidas([]);
        setError("");
        onCancelar();
    };

    const ejecutar = async (accion: () => Promise<unknown>, fallo: string, cerrarAlTerminar = false) => {
        setError("");
        setGuardando(true);
        try {
            await accion();
            await onGuardado();
            if (cerrarAlTerminar) cerrar();
        } catch (err) {
            setError(err instanceof Error ? err.message : fallo);
        } finally {
            setGuardando(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const valor = Number(precioEscrito);

        if (precioEscrito.trim() === "" || !Number.isFinite(valor) || valor < 0) {
            setError("Ingresá un precio válido (0 si es gratuita)");
            return;
        }
        // Mismo límite que el backend: con más de 2 decimales lo rechazaría con un mensaje técnico
        if (Math.round(valor * 100) !== valor * 100) {
            setError("El precio puede tener como mucho 2 decimales");
            return;
        }
        if (elegidas.length === 0) {
            setError("Elegí al menos una jornada");
            return;
        }

        await ejecutar(
            () => configurarBoleteria(elegidas.map((jornada) => jornada.id), valor),
            "No se pudo configurar la boletería",
            true,
        );
    };

    return (
        <Modal isOpen={isOpen} closeModal={cerrar} title="Configurar boletería">
            <form noValidate onSubmit={onSubmit} className="grid w-[min(92vw,52rem)] gap-6 md:grid-cols-2">
                {/* ── La entrada de la puerta ──────────────────────────────── */}
                <div className="flex flex-col gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Entrada en puerta</p>
                        <p className="mt-1 font-semibold text-slate-800">General Boletería</p>
                        <p className="mt-1 text-xs text-slate-500">
                            El nombre es fijo. En la puerta se vende un solo tipo de entrada: las demás son anticipadas.
                        </p>
                    </div>
                    <Input
                        label="Precio"
                        name="precio-boleteria"
                        type="number"
                        min={0}
                        step={1000}
                        value={precioEscrito}
                        onChange={(e) => {
                            setPrecio(e.target.value);
                            setError("");
                        }}
                    />
                    <span className="text-xs text-gray-500">
                        No hay cantidad: los tickets se crean al vender en la puerta. Cambiar el precio no modifica lo
                        ya vendido. No hace falta configurarla para publicar.
                    </span>
                </div>

                {/* ── Jornadas ────────────────────────────────────────────── */}
                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 flex w-full items-center justify-between text-sm font-medium text-gray-700">
                        <span>
                            Jornadas ({elegidas.length} de {jornadas.length})
                        </span>
                        <span className="flex gap-3 text-xs font-normal">
                            <button type="button" className="cursor-pointer text-blue-600 hover:underline" onClick={() => elegirTodas(true)}>
                                Todas
                            </button>
                            <button type="button" className="cursor-pointer text-blue-600 hover:underline" onClick={() => elegirTodas(false)}>
                                Ninguna
                            </button>
                        </span>
                    </legend>
                    <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                        {jornadas.map((jornada) => {
                            const actual = boleteriaDe.get(jornada.id);
                            // Nunca vendió nada (ni siquiera algo después anulado): se puede quitar
                            const sePuedeQuitar = actual && actual.vendidos + actual.anulados === 0;
                            return (
                                <li key={jornada.id} className="rounded-md px-2 py-1.5 hover:bg-gray-50">
                                    <label className="flex cursor-pointer items-center gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={!excluidas.includes(jornada.id)}
                                            onChange={() => alternar(jornada.id)}
                                        />
                                        <span className="flex-1">
                                            <span className="font-medium text-gray-800">{titulos[jornada.id]}</span>{" "}
                                            <span className="text-gray-500">{fechaCortaConDia(jornada.fechaHoraInicio)}</span>
                                        </span>
                                        <Etiqueta color={coloresEstadoEvento[jornada.estado]}>{jornada.estado}</Etiqueta>
                                    </label>
                                    <div className="ml-7 mt-0.5 flex flex-wrap items-center gap-x-3 text-xs">
                                        {actual ? (
                                            <>
                                                <span className="text-slate-600">
                                                    Actual: {formatPrecio(Number(actual.precio))}
                                                    {actual.vendidos > 0 && ` · ${actual.vendidos} vendidas`}
                                                    {!actual.habilitada && <strong className="text-amber-700"> · pausada</strong>}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={guardando}
                                                    className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50"
                                                    onClick={() =>
                                                        ejecutar(
                                                            () => (actual.habilitada ? deshabilitarEntrada(actual.id) : habilitarEntrada(actual.id)),
                                                            "No se pudo cambiar la boletería",
                                                        )
                                                    }
                                                >
                                                    {actual.habilitada ? "Pausar" : "Reanudar"}
                                                </button>
                                                {sePuedeQuitar && (
                                                    <button
                                                        type="button"
                                                        disabled={guardando}
                                                        className="cursor-pointer text-red-600 hover:underline disabled:opacity-50"
                                                        onClick={() => ejecutar(() => deleteEntrada(actual.id), "No se pudo quitar la boletería")}
                                                    >
                                                        Quitar
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-slate-400">Sin boletería</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </fieldset>

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 md:col-span-2">
                    {error && (
                        <span role="alert" className="text-sm font-medium text-red-600">
                            {error}
                        </span>
                    )}
                    <div className="flex justify-end gap-3">
                        <Btn type="button" variant="cancel" onClick={cerrar} disabled={guardando}>
                            Cerrar
                        </Btn>
                        <Btn type="submit" disabled={guardando || elegidas.length === 0}>
                            {guardando
                                ? "Guardando..."
                                : nuevas === elegidas.length
                                  ? `Configurar en ${elegidas.length} jornada${elegidas.length === 1 ? "" : "s"}`
                                  : `Guardar en ${elegidas.length} jornada${elegidas.length === 1 ? "" : "s"}`}
                        </Btn>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ConfigurarBoleteriaModal;
