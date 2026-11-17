import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { getEntradasDeCompra, type EntradaComprada } from "../../../services/comprasService";
import { fechaCortaConDia, horaArgentina } from "../../../utils/zonaHoraria";

type EntradasCompradasProps = {
    idOrden: number;
    clave: string;
};

/*
    Las entradas de una compra aprobada, cada una con su QR: es lo que el
    comprador muestra en la puerta (desde el celular o impreso). Hasta que
    exista el envío por mail, esta pantalla es la única forma de tenerlas.
*/
const EntradasCompradas = ({ idOrden, clave }: EntradasCompradasProps) => {
    const [entradas, setEntradas] = useState<EntradaComprada[] | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getEntradasDeCompra(idOrden, clave)
            .then(setEntradas)
            .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar tus entradas"));
    }, [idOrden, clave]);

    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!entradas) return <p className="text-sm text-gray-500">Cargando tus entradas…</p>;

    return (
        <section aria-label="Tus entradas" className="flex w-full flex-col gap-3 text-left">
            <h2 className="text-lg font-semibold text-noche">Tus entradas</h2>
            <p className="text-sm text-gray-600">
                Mostrá el QR de cada entrada en la puerta. Podés sacarle una captura o imprimir esta página.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
                {entradas.map((entrada) => (
                    <li key={entrada.id} className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4">
                        <img src={entrada.imagenQR} alt={`QR de la entrada ${entrada.numero}`} className="h-44 w-44" />
                        <div className="flex w-full flex-col gap-1 text-sm">
                            <span className="font-semibold text-noche">{entrada.evento}</span>
                            <span className="text-gray-700">
                                {entrada.jornada ? `${entrada.jornada} · ` : ""}{entrada.entrada} · N° {entrada.numero}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <CalendarDays className="h-4 w-4 text-marca" />
                                {fechaCortaConDia(entrada.fechaHoraInicio)} · {horaArgentina(entrada.fechaHoraInicio)}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <MapPin className="h-4 w-4 shrink-0 text-marca" />
                                {entrada.direccion}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default EntradasCompradas;
