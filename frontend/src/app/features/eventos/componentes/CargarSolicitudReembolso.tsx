import { useState } from "react";
import { Search } from "lucide-react";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import {
    buscarTicketsParaReembolso,
    canalDeVenta,
    registrarReembolsos,
    type BusquedaTickets,
    type JornadaConDevoluciones,
    type TicketBuscado,
} from "../../../services/reembolsosService";

type FormaBusqueda = "qr" | "lote" | "orden" | "dni";

const FORMAS: { forma: FormaBusqueda; titulo: string }[] = [
    { forma: "qr", titulo: "Código QR" },
    { forma: "lote", titulo: "Lote y número" },
    { forma: "orden", titulo: "N° de orden" },
    { forma: "dni", titulo: "DNI" },
];

type CargarSolicitudReembolsoProps = {
    idEvento: number;
    // Las jornadas suspendidas o canceladas, con sus lotes (para buscar por lote y número)
    jornadas: JornadaConDevoluciones[];
    onRegistradas: (cantidad: number) => void | Promise<void>;
};

/*
    Cargar la solicitud de devolución de quien se presenta con su ticket (o
    la pide por otro medio). Se busca el ticket de una de cuatro formas: el
    QR del papel (con el lector o pegado), el lote y el número impreso, o el
    N° de orden o el DNI de una compra online. De lo encontrado se marcan los
    que se devuelven: los que no se pueden devolver muestran por qué.
*/
const CargarSolicitudReembolso = ({ idEvento, jornadas, onRegistradas }: CargarSolicitudReembolsoProps) => {
    const [forma, setForma] = useState<FormaBusqueda>("qr");
    const [texto, setTexto] = useState("");
    const [idEntrada, setIdEntrada] = useState("");
    const [resultados, setResultados] = useState<TicketBuscado[] | null>(null);
    const [elegidos, setElegidos] = useState<number[]>([]);
    const [motivo, setMotivo] = useState("");
    const [error, setError] = useState("");
    const [trabajando, setTrabajando] = useState(false);

    const lotes = jornadas.flatMap((j) => j.entradas.map((e) => ({ ...e, jornada: j })));

    const limpiar = () => {
        setResultados(null);
        setElegidos([]);
        setError("");
    };

    const armarBusqueda = (): BusquedaTickets | string => {
        const valor = texto.trim();
        if (forma === "lote") {
            if (!idEntrada) return "Elegí el lote";
            if (!valor) return "Ingresá el número del ticket";
            return { idEntrada: Number(idEntrada), numero: valor };
        }
        if (!valor) return "Completá el dato para buscar";
        if (forma === "qr") return { codigoQR: valor };
        if (forma === "orden") {
            const id = Number(valor.replace(/^#/, ""));
            return Number.isInteger(id) && id > 0 ? { idOrden: id } : "El N° de orden es un número";
        }
        return /^\d{7,8}$/.test(valor) ? { dni: valor } : "El DNI debe tener 7 u 8 números, sin puntos";
    };

    const buscar = async (e: React.FormEvent) => {
        e.preventDefault();
        limpiar();
        const busqueda = armarBusqueda();
        if (typeof busqueda === "string") {
            setError(busqueda);
            return;
        }
        setTrabajando(true);
        try {
            const encontrados = await buscarTicketsParaReembolso(idEvento, busqueda);
            setResultados(encontrados);
            // Se marcan de entrada todos los que se pueden devolver
            setElegidos(encontrados.filter((t) => t.devolvible).map((t) => t.id));
            // Motivo sugerido según cómo está la jornada del primer ticket devolvible
            const jornada = encontrados.find((t) => t.devolvible)?.entrada.jornada;
            if (jornada && !motivo) setMotivo(jornada.estado === "Cancelado" ? "Jornada cancelada" : "Jornada suspendida");
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo buscar");
        } finally {
            setTrabajando(false);
        }
    };

    const registrar = async () => {
        if (!motivo.trim()) {
            setError("Ingresá el motivo");
            return;
        }
        setTrabajando(true);
        setError("");
        try {
            const { registradas } = await registrarReembolsos(idEvento, elegidos, motivo.trim());
            setTexto("");
            setMotivo("");
            limpiar();
            await onRegistradas(registradas);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cargar la solicitud");
        } finally {
            setTrabajando(false);
        }
    };

    const alternar = (id: number) => setElegidos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const totalElegido = (resultados ?? []).filter((t) => elegidos.includes(t.id)).reduce((s, t) => s + Number(t.precio), 0);

    return (
        <div className="flex flex-col gap-4 p-6">
            <div role="tablist" aria-label="Buscar el ticket por" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:grid-cols-4">
                {FORMAS.map(({ forma: f, titulo }) => (
                    <button
                        key={f}
                        type="button"
                        role="tab"
                        aria-selected={forma === f}
                        onClick={() => {
                            setForma(f);
                            setTexto("");
                            limpiar();
                        }}
                        className={cn(
                            "cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                            forma === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
                        )}
                    >
                        {titulo}
                    </button>
                ))}
            </div>

            <form onSubmit={buscar} noValidate className="flex flex-wrap items-end gap-3">
                {forma === "lote" && (
                    <label className="flex min-w-56 flex-col gap-1 text-sm font-medium text-gray-700">
                        Lote
                        <select
                            value={idEntrada}
                            onChange={(e) => {
                                setIdEntrada(e.target.value);
                                limpiar();
                            }}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">Elegí el lote</option>
                            {lotes.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.descripcion} · {l.jornada.nombre ?? "Jornada"} {fechaCortaConDia(l.jornada.fechaHoraInicio)}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <div className="min-w-56 flex-1">
                    <Input
                        label={forma === "qr" ? "Código del QR" : forma === "lote" ? "Número del ticket" : forma === "orden" ? "N° de orden" : "DNI del comprador"}
                        name="busqueda-reembolso"
                        type="text"
                        autoComplete="off"
                        placeholder={forma === "qr" ? "Escaneá el QR o pegá el código" : forma === "lote" ? "Ej: 145" : forma === "orden" ? "Ej: 32" : "Sin puntos"}
                        value={texto}
                        onChange={(e) => {
                            setTexto(e.target.value);
                            limpiar();
                        }}
                    />
                </div>
                <Btn type="submit" className="gap-2" disabled={trabajando}>
                    <Search className="h-4 w-4" />
                    Buscar
                </Btn>
            </form>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            {resultados && resultados.length === 0 && (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">No se encontró ningún ticket de este evento con ese dato.</p>
            )}

            {resultados && resultados.length > 0 && (
                <>
                    <ul className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200">
                        {resultados.map((t) => (
                            <li key={t.id}>
                                <label className={cn("flex items-start gap-3 px-4 py-3 text-sm", t.devolvible ? "cursor-pointer hover:bg-slate-50" : "opacity-70")}>
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        disabled={!t.devolvible}
                                        checked={elegidos.includes(t.id)}
                                        onChange={() => alternar(t.id)}
                                    />
                                    <span className="flex flex-1 flex-col gap-0.5">
                                        <span className="font-semibold text-slate-800">
                                            {t.entrada.descripcion} #{t.numero}{" "}
                                            <span className="font-normal text-slate-500">
                                                · {t.entrada.jornada.nombre ?? "Jornada"} {fechaCortaConDia(t.entrada.jornada.fechaHoraInicio)} ({t.entrada.jornada.estado.toLowerCase()})
                                            </span>
                                        </span>
                                        <span className="text-slate-500">
                                            {canalDeVenta(t)}
                                            {t.orden?.cliente && ` · ${t.orden.cliente.nombre} (DNI ${t.orden.cliente.dni}) · orden N° ${t.orden.id}`}
                                        </span>
                                        {!t.devolvible && <span className="text-amber-700">{t.motivoNoDevolvible}</span>}
                                    </span>
                                    <span className="font-semibold tabular-nums text-slate-900">{formatPrecio(Number(t.precio))}</span>
                                </label>
                            </li>
                        ))}
                    </ul>

                    {resultados.some((t) => t.devolvible) && (
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-64 flex-1">
                                <Input
                                    label="Motivo"
                                    name="motivo-reembolso"
                                    type="text"
                                    maxLength={300}
                                    value={motivo}
                                    onChange={(e) => {
                                        setMotivo(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>
                            <Btn onClick={registrar} disabled={trabajando || elegidos.length === 0}>
                                {trabajando
                                    ? "Cargando…"
                                    : `Cargar ${elegidos.length} solicitud${elegidos.length === 1 ? "" : "es"} · ${formatPrecio(totalElegido)}`}
                            </Btn>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CargarSolicitudReembolso;
