import { useEffect, useMemo, useState } from "react";
import Btn from "../../../ui/componentes/Btn";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import TablaLoteRendicion, { type Resultado } from "./TablaLoteRendicion";
import { formatPrecio } from "../../../utils/formatoPrecio";
import { fechaCortaConDia } from "../../../utils/zonaHoraria";
import type { PuntoVenta } from "../../../services/puntosVentaService";
import {
    getPendiente,
    registrarRendicion,
    type Pendiente,
    type TicketPendiente,
    type TipoComision,
} from "../../../services/rendicionesService";

const opcionesComision: { label: string; value: TipoComision }[] = [
    { label: "Sin comisión", value: "Ninguna" },
    { label: "Porcentaje de lo vendido", value: "Porcentaje" },
    { label: "Monto fijo", value: "MontoFijo" },
];

const redondear = (monto: number) => Math.round(monto * 100) / 100;

// "1 vendido" / "3 vendidos"
const cantidad = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

const nombreJornada = (t: TicketPendiente) =>
    `${t.entrada.jornada.nombre ?? "Jornada"} · ${fechaCortaConDia(t.entrada.jornada.fechaHoraInicio)}` +
    (t.entrada.jornada.estado === "Cancelado" ? " (cancelada)" : "");

type PanelRendicionProps = {
    idEvento: number;
    puntoVenta: PuntoVenta;
    onRegistrada: () => void;
};

/*
    Arma la rendición de un local: sus tickets pendientes (de todas las
    jornadas del evento), qué pasó con cada uno, la comisión y la plata que
    entregó. Nada se guarda hasta confirmar.
*/
const PanelRendicion = ({ idEvento, puntoVenta, onRegistrada }: PanelRendicionProps) => {
    const [pendiente, setPendiente] = useState<Pendiente | null>(null);
    const [resultados, setResultados] = useState<Map<number, Resultado>>(new Map());
    const [tipoComision, setTipoComision] = useState<TipoComision>("Ninguna");
    const [valorComision, setValorComision] = useState("");
    const [montoRecibido, setMontoRecibido] = useState("");
    const [observacion, setObservacion] = useState("");
    const [error, setError] = useState("");
    const [confirmando, setConfirmando] = useState(false);

    useEffect(() => {
        setPendiente(null);
        getPendiente(idEvento, puntoVenta.id)
            .then((datos) => {
                setPendiente(datos);
                setResultados(new Map(datos.tickets.map((t) => [t.id, "vendido"])));
            })
            .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar lo pendiente"));
    }, [idEvento, puntoVenta.id]);

    const tickets = pendiente?.tickets ?? [];
    const hayCancelados = tickets.some((t) => t.entrada.jornada.estado === "Cancelado");
    const resultadoDe = (t: TicketPendiente): Resultado => (t.estado === "Usado" ? "vendido" : resultados.get(t.id) ?? "vendido");

    // Los pendientes agrupados por lote (vienen ordenados por jornada, lote y número)
    const lotes = useMemo(() => {
        const porLote = new Map<number, TicketPendiente[]>();
        tickets.forEach((t) => porLote.set(t.entrada.id, [...(porLote.get(t.entrada.id) ?? []), t]));
        return [...porLote.values()];
    }, [tickets]);

    const aplicar = (ids: number[], resultado: Resultado) => {
        setResultados((prev) => {
            const nuevos = new Map(prev);
            ids.forEach((id) => nuevos.set(id, resultado));
            return nuevos;
        });
        setError("");
    };

    // ── CUENTAS (las mismas que repite el backend al guardar) ───────────────
    const vendidos = tickets.filter((t) => resultadoDe(t) === "vendido");
    const siguen = tickets.filter((t) => resultadoDe(t) === "sigue");
    const devueltos = tickets.filter((t) => resultadoDe(t) === "devuelto");

    const montoVendido = vendidos.reduce((suma, t) => suma + Number(t.precio), 0);
    const valor = Number(valorComision);
    const montoComision =
        tipoComision === "Porcentaje" ? redondear((montoVendido * valor) / 100) : tipoComision === "MontoFijo" ? valor : 0;
    const saldoAnterior = Number(pendiente?.saldoAnterior ?? 0);
    const aCobrar = redondear(saldoAnterior + montoVendido - montoComision);
    const recibido = Number(montoRecibido);
    const quedaDebiendo = redondear(aCobrar - recibido);

    const validar = () => {
        if (tipoComision !== "Ninguna" && (valorComision === "" || !Number.isFinite(valor) || valor < 0)) {
            return "Ingresá el valor de la comisión";
        }
        if (tipoComision === "Porcentaje" && valor > 100) return "El porcentaje de comisión no puede superar el 100%";
        if (tipoComision === "MontoFijo" && valor > montoVendido) return "La comisión no puede superar lo vendido";
        if (montoRecibido === "" || !Number.isFinite(recibido) || recibido < 0) return "Ingresá el monto que entregó el local (0 si no entregó nada)";
        if (recibido > aCobrar) return `El monto recibido supera lo que corresponde cobrar (${formatPrecio(aCobrar)})`;
        if (vendidos.length === 0 && devueltos.length === 0 && recibido === 0) {
            return "No hay nada para rendir: marcá tickets vendidos o devueltos, o cargá un pago";
        }
        return "";
    };

    const pedirConfirmacion = () => {
        const problema = validar();
        setError(problema);
        if (!problema) setConfirmando(true);
    };

    const registrar = async () => {
        await registrarRendicion({
            idEvento,
            idPuntoVenta: puntoVenta.id,
            idsVendidos: vendidos.map((t) => t.id),
            idsDevueltos: devueltos.map((t) => t.id),
            tipoComision,
            valorComision: tipoComision === "Ninguna" ? undefined : valor,
            montoRecibido: recibido,
            observacion: observacion.trim() || undefined,
        });
        setConfirmando(false);
        onRegistrada();
    };

    if (!pendiente) {
        return error
            ? <p role="alert" className="p-6 text-sm text-red-600">{error}</p>
            : <p className="p-6 text-sm text-gray-400">Cargando…</p>;
    }

    if (tickets.length === 0 && saldoAnterior === 0) {
        return (
            <p className="p-6 text-sm text-gray-500">
                {puntoVenta.nombre} no tiene tickets pendientes de rendir ni deuda en este evento.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-6">
            {/* ── TICKETS PENDIENTES ──────────────────────────────────────── */}
            {tickets.length > 0 && (
                <section className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600">
                        Todos arrancan como <strong>vendidos</strong>. Marcá los que el local <strong>sigue teniendo</strong> y
                        los que <strong>devuelve</strong> (se anulan).
                    </p>
                    {hayCancelados && (
                        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            Hay tickets de jornadas canceladas: los que el local no vendió marcalos como devueltos. Los
                            vendidos se cobran igual y el reembolso a cada comprador lo hace el organizador.
                        </p>
                    )}

                    {lotes.map((delLote) => (
                        <TablaLoteRendicion
                            key={delLote[0].entrada.id}
                            titulo={`${delLote[0].entrada.descripcion} · ${nombreJornada(delLote[0])}`}
                            precio={Number(delLote[0].precio)}
                            tickets={delLote}
                            resultadoDe={resultadoDe}
                            onAplicar={aplicar}
                        />
                    ))}
                </section>
            )}

            {/* ── CUENTAS ─────────────────────────────────────────────────── */}
            <section className="grid gap-6 rounded-lg border border-gray-200 p-5 md:grid-cols-2">
                <dl className="flex flex-col gap-2 text-sm">
                    <Fila label={`Vendidos (${vendidos.length})`}>{formatPrecio(montoVendido)}</Fila>
                    <Fila label="Siguen en el local">{siguen.length}</Fila>
                    <Fila label="Devueltos (se anulan)">{devueltos.length}</Fila>
                    <Fila label="Comisión">− {formatPrecio(montoComision)}</Fila>
                    {saldoAnterior > 0 && <Fila label="Deuda anterior">+ {formatPrecio(saldoAnterior)}</Fila>}
                    <div className="mt-1 border-t border-gray-200 pt-2">
                        <Fila label={<strong className="text-gray-900">Total a cobrar</strong>}>
                            <strong>{formatPrecio(aCobrar)}</strong>
                        </Fila>
                    </div>
                    {montoRecibido !== "" && quedaDebiendo > 0 && (
                        <Fila label={<span className="text-amber-700">Queda debiendo</span>}>
                            <span className="text-amber-700">{formatPrecio(quedaDebiendo)}</span>
                        </Fila>
                    )}
                </dl>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-[1fr_8rem] items-end gap-3">
                        <Select
                            label="Comisión del local"
                            name="tipoComision"
                            opciones={opcionesComision}
                            value={tipoComision}
                            onChange={(e) => {
                                setTipoComision(e.target.value as TipoComision);
                                setValorComision("");
                            }}
                        />
                        <Input
                            label={tipoComision === "Porcentaje" ? "%" : "Monto"}
                            name="valorComision"
                            type="number"
                            min={0}
                            disabled={tipoComision === "Ninguna"}
                            value={valorComision}
                            onChange={(e) => setValorComision(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Monto que entregó el local"
                        name="montoRecibido"
                        type="number"
                        min={0}
                        placeholder={String(aCobrar)}
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                    />
                    <Input
                        label="Observación (opcional)"
                        name="observacion"
                        type="text"
                        maxLength={500}
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                    />
                </div>
            </section>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end">
                <Btn onClick={pedirConfirmacion}>Registrar rendición</Btn>
            </div>

            {confirmando && (
                <ConfirmarAccion
                    isOpen
                    title="Registrar rendición"
                    variante="primary"
                    mensaje={
                        `Registrar la rendición de «${puntoVenta.nombre}»: ${cantidad(vendidos.length, "vendido", "vendidos")}, ` +
                        `${cantidad(devueltos.length, "devuelto", "devueltos")} y ` +
                        `${cantidad(siguen.length, "que sigue en el local", "que siguen en el local")}; ` +
                        `entregó ${formatPrecio(recibido)}` +
                        (quedaDebiendo > 0 ? ` y queda debiendo ${formatPrecio(quedaDebiendo)}` : "") +
                        ". No se puede deshacer"
                    }
                    onConfirmar={registrar}
                    onCancelar={() => setConfirmando(false)}
                />
            )}
        </div>
    );
};

const Fila = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
        <dt className="text-gray-500">{label}</dt>
        <dd className="font-medium text-gray-800">{children}</dd>
    </div>
);

export default PanelRendicion;
