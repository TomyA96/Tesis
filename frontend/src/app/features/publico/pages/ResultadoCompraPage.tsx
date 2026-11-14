import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, CircleX, Clock, LoaderCircle } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import FondoMosaico from "../../../ui/componentes/FondoMosaico";
import { getEstadoCompra, type EstadoOrden } from "../../../services/comprasService";

// Cada cuánto se vuelve a preguntar mientras el pago sigue pendiente, y cuántas veces
const SEGUNDOS_ENTRE_CONSULTAS = 3;
const MAX_CONSULTAS = 20;

/*
    A esta pantalla vuelve el cliente después de pagar en Mercado Pago (la URL
    trae "?orden=<id>"). Lo que diga la URL no es de fiar: acá se le pregunta
    el estado real a nuestro backend, que a su vez se lo confirma a Mercado
    Pago. Si el pago todavía no figura, se vuelve a preguntar cada pocos
    segundos: a veces Mercado Pago tarda un instante en acreditarlo.
*/
const ResultadoCompraPage = () => {
    const [params] = useSearchParams();
    const idOrden = Number(params.get("orden"));
    const ordenValida = Number.isInteger(idOrden) && idOrden > 0;

    const [estado, setEstado] = useState<EstadoOrden | null>(null);
    const [error, setError] = useState("");
    // Subir este número vuelve a empezar las consultas (botón "Consultar de nuevo")
    const [reintento, setReintento] = useState(0);

    useEffect(() => {
        if (!ordenValida) return;

        let cancelado = false;
        let temporizador: number | undefined;
        let consultas = 0;

        const consultar = async () => {
            try {
                const respuesta = await getEstadoCompra(idOrden);
                if (cancelado) return;
                setEstado(respuesta.estado);
                setError("");
                consultas++;
                if (respuesta.estado === "Pendiente" && consultas < MAX_CONSULTAS) {
                    temporizador = window.setTimeout(consultar, SEGUNDOS_ENTRE_CONSULTAS * 1000);
                }
            } catch (err) {
                if (cancelado) return;
                setError(err instanceof Error ? err.message : "No se pudo consultar tu compra");
            }
        };
        consultar();

        // Al salir de la pantalla (o al reintentar) se corta lo que estaba en marcha
        return () => {
            cancelado = true;
            window.clearTimeout(temporizador);
        };
    }, [idOrden, ordenValida, reintento]);

    const reintentar = () => {
        setEstado(null);
        setReintento((n) => n + 1);
    };

    return (
        <main className="relative isolate flex-1 bg-gray-300 flex justify-center p-4 md:p-8">
            <FondoMosaico />
            <ContenedorDatos className="max-w-xl h-fit p-6 md:p-8 gap-6 items-center text-center">
                {!ordenValida ? (
                    <Mensaje
                        icono={<CircleX className="h-12 w-12 text-red-600" />}
                        titulo="No encontramos tu compra"
                        texto="El link no es válido. Si pagaste, revisá tu mail o escribinos."
                    />
                ) : error ? (
                    <>
                        <Mensaje
                            icono={<CircleX className="h-12 w-12 text-red-600" />}
                            titulo="No pudimos consultar tu compra"
                            texto={error}
                        />
                        <Btn type="button" onClick={reintentar}>Consultar de nuevo</Btn>
                    </>
                ) : estado === null ? (
                    <Mensaje
                        icono={<LoaderCircle className="h-12 w-12 animate-spin text-marca" />}
                        titulo="Confirmando tu pago…"
                        texto="Esto toma unos segundos. No cierres esta página."
                    />
                ) : estado === "Aprobada" ? (
                    <Mensaje
                        icono={<CircleCheck className="h-12 w-12 text-green-600" />}
                        titulo="¡Compra confirmada!"
                        texto={`Tu pago se acreditó y tus entradas quedaron a tu nombre. Número de compra: ${idOrden}.`}
                    />
                ) : estado === "Pendiente" ? (
                    <>
                        <Mensaje
                            icono={<Clock className="h-12 w-12 text-amber-500" />}
                            titulo="Estamos esperando la confirmación del pago"
                            texto="Todavía no recibimos la acreditación. Si ya pagaste, puede demorar unos minutos."
                        />
                        <Btn type="button" onClick={reintentar}>Consultar de nuevo</Btn>
                    </>
                ) : (
                    <Mensaje
                        icono={<CircleX className="h-12 w-12 text-red-600" />}
                        titulo="El pago no se completó"
                        texto="Tu compra no se realizó y tus entradas se liberaron. Podés volver a intentarlo."
                    />
                )}

                <Link to={RUTAS.publico.inicio} className="text-sm font-medium text-marca hover:underline">
                    Volver al inicio
                </Link>
            </ContenedorDatos>
        </main>
    );
};

const Mensaje = ({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) => (
    <div className="flex flex-col items-center gap-3">
        {icono}
        <h1 className="text-2xl font-bold text-noche">{titulo}</h1>
        <p className="text-gray-600">{texto}</p>
    </div>
);

export default ResultadoCompraPage;
