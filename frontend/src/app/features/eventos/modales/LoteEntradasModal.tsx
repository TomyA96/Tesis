import { useState } from "react";
import Modal from "../../../ui/componentes/Modal";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import { createEntradasLote } from "../../../services/entradasService";
import type { Jornada } from "../../../services/jornadasService";
import { coloresEstadoEvento } from "../eventos.columns";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";

type LoteEntradasModalProps = {
    isOpen: boolean;
    // Solo las que pueden recibir entradas (ni finalizadas ni canceladas), en orden
    jornadas: Jornada[];
    // Nombre a mostrar de cada jornada, por id ("Jornada N" si no tiene)
    titulos: Record<number, string>;
    onCreado: () => void | Promise<void>;
    onCancelar: () => void;
};

type DatosLote = {
    descripcion: string;
    precio: string;
    esFisica: boolean;
    cantidad: string;
};

const datosVacios: DatosLote = { descripcion: "", precio: "", esFisica: false, cantidad: "" };

/*
    Crea el mismo lote de entradas en varias jornadas a la vez: uno en cada
    jornada elegida (cada una con su propio cupo y sus propias ventas), no
    uno compartido. Todas vienen marcadas; se destildan las que no lo llevan.
    Los lotes nacen en Borrador, igual que una entrada creada suelta.
*/
const LoteEntradasModal = ({ isOpen, jornadas, titulos, onCreado, onCancelar }: LoteEntradasModalProps) => {
    const [datos, setDatos] = useState<DatosLote>(datosVacios);
    // Se guardan las DESTILDADAS: así, si se agrega una jornada, entra marcada sin tocar nada
    const [excluidas, setExcluidas] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const elegidas = jornadas.filter((jornada) => !excluidas.includes(jornada.id));

    const cambiar = (cambios: Partial<DatosLote>) => {
        setDatos((prev) => ({ ...prev, ...cambios }));
        setError("");
    };

    const alternar = (idJornada: number) => {
        setExcluidas((prev) => (prev.includes(idJornada) ? prev.filter((id) => id !== idJornada) : [...prev, idJornada]));
        setError("");
    };

    // "Todas" y "Ninguna": cambiar la selección también resuelve (o cambia) el problema que mostraba el aviso
    const elegirTodas = (todas: boolean) => {
        setExcluidas(todas ? [] : jornadas.map((jornada) => jornada.id));
        setError("");
    };

    const cerrar = () => {
        setDatos(datosVacios);
        setExcluidas([]);
        setError("");
        onCancelar();
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const descripcion = datos.descripcion.trim();
        const precio = Number(datos.precio);
        const cantidad = Number(datos.cantidad);

        if (!descripcion) {
            setError("Ingresá una descripción para el lote");
            return;
        }
        if (datos.precio === "" || !Number.isFinite(precio) || precio < 0) {
            setError("Ingresá un precio válido (0 si es gratuita)");
            return;
        }
        // Number("") da 0: un campo vacío también cae acá
        if (!Number.isInteger(cantidad) || cantidad < 1) {
            setError("La cantidad por jornada tiene que ser un número entero mayor a 0");
            return;
        }
        if (elegidas.length === 0) {
            setError("Elegí al menos una jornada");
            return;
        }

        setGuardando(true);
        try {
            await createEntradasLote({
                descripcion,
                precio,
                esFisica: datos.esFisica,
                cantidad,
                idsJornadas: elegidas.map((jornada) => jornada.id),
            });
            setDatos(datosVacios);
            setExcluidas([]);
            await onCreado();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo crear el lote");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} closeModal={cerrar} title="Lote de entradas para varias jornadas">
            <form noValidate onSubmit={onSubmit} className="grid w-[min(92vw,52rem)] gap-6 md:grid-cols-2">
                {/* ── Datos del lote ─────────────────────────────────────── */}
                <div className="flex flex-col gap-3">
                    <Input
                        label="Descripción"
                        name="descripcion"
                        type="text"
                        placeholder="Ej: General, VIP"
                        value={datos.descripcion}
                        onChange={(e) => cambiar({ descripcion: e.target.value })}
                    />
                    <Input
                        label="Precio"
                        name="precio"
                        type="number"
                        min={0}
                        step={1000}
                        value={datos.precio}
                        onChange={(e) => cambiar({ precio: e.target.value })}
                    />

                    <fieldset className="flex flex-col gap-1 text-sm text-gray-700">
                        <legend className="mb-1 font-medium">Tipo de entrada</legend>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name="tipo-lote"
                                checked={!datos.esFisica}
                                onChange={() => cambiar({ esFisica: false })}
                            />
                            Online
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name="tipo-lote"
                                checked={datos.esFisica}
                                onChange={() => cambiar({ esFisica: true })}
                            />
                            Física
                        </label>
                    </fieldset>

                    <Input
                        label="Cantidad por jornada"
                        name="cantidad"
                        type="number"
                        min={1}
                        value={datos.cantidad}
                        onChange={(e) => cambiar({ cantidad: e.target.value })}
                    />
                    <span className="text-xs text-gray-500">
                        Cada jornada recibe su propio lote con esta cantidad de tickets. Los lotes se crean
                        en Borrador: los tickets se generan al publicarlos (online) o imprimirlos (física).
                    </span>
                </div>

                {/* ── Jornadas donde se crea ─────────────────────────────── */}
                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 flex w-full items-center justify-between text-sm font-medium text-gray-700">
                        <span>
                            Jornadas ({elegidas.length} de {jornadas.length})
                        </span>
                        <span className="flex gap-3 text-xs font-normal">
                            <button type="button" className="cursor-pointer text-blue-600 hover:underline" onClick={() => elegirTodas(true)}>
                                Todas
                            </button>
                            <button
                                type="button"
                                className="cursor-pointer text-blue-600 hover:underline"
                                onClick={() => elegirTodas(false)}
                            >
                                Ninguna
                            </button>
                        </span>
                    </legend>
                    <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                        {jornadas.map((jornada) => (
                            <li key={jornada.id}>
                                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
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
                            </li>
                        ))}
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
                            Cancelar
                        </Btn>
                        <Btn type="submit" disabled={guardando || elegidas.length === 0}>
                            {guardando
                                ? "Creando..."
                                : `Crear en ${elegidas.length} jornada${elegidas.length === 1 ? "" : "s"}`}
                        </Btn>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default LoteEntradasModal;
