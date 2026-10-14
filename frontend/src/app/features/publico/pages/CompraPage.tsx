import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import Btn from "../../../ui/componentes/Btn";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import ResumenCompra from "../componentes/ResumenCompra";
import PagoCompra from "../componentes/PagoCompra";
import DatosCompradorForm from "../forms/DatosCompradorForm";
import { datosVacios, MAX_POR_COMPRA, totalDeLineas, type DatosComprador, type LineaCompra } from "../compra";
import FondoMosaico from "../../../ui/componentes/FondoMosaico";
import { crearCompra, type OrdenCompraCreada } from "../../../services/comprasService";

type Paso = "resumen" | "datos" | "pago" | "confirmacion";

const titulosPaso: Record<Paso, string> = {
    resumen: "Resumen de tu compra",
    datos: "Tus datos",
    pago: "Pago",
    confirmacion: "Compra registrada",
};

const CompraPage = () => {
    const { idEvento } = useParams();
    const navigate = useNavigate();

    // Las entradas elegidas llegan en el state de la navegación (ver el botón
    // "Comprar" de EventoDetallePage). Si se recarga esta página o se entra
    // por link directo, ese state no existe.
    const { state } = useLocation();
    const lineasIniciales = (state as { lineas?: LineaCompra[] } | null)?.lineas;

    // La página es la dueña de todo el estado: los pasos solo reciben datos
    // por props y avisan los cambios con funciones.
    const [paso, setPaso] = useState<Paso>("resumen");
    const [lineas, setLineas] = useState<LineaCompra[]>(lineasIniciales ?? []);
    const [datos, setDatos] = useState<DatosComprador>(datosVacios);
    const [error, setError] = useState("");
    const [confirmandoSalir, setConfirmandoSalir] = useState(false);
    // Mientras la petición está en curso el botón queda bloqueado (evita el doble clic).
    const [enviando, setEnviando] = useState(false);
    // El estado se actualiza recién en el próximo render; la ref, al instante. Con la ref
    // dos clics seguidos no pueden mandar la compra dos veces.
    const enviandoRef = useRef(false);
    const [errorPago, setErrorPago] = useState("");
    const [orden, setOrden] = useState<OrdenCompraCreada | null>(null);

    // Sin selección no hay nada que comprar: volver al evento.
    if (!lineasIniciales || lineasIniciales.length === 0) {
        return <Navigate to={RUTAS.publico.detalle(idEvento ?? "")} replace />;
    }

    const total = totalDeLineas(lineas);

    const cambiarCantidad = (idEntrada: number, cambio: number) => {
        // Igual que en EventoDetallePage: calcular a partir de prev, con
        // piso 0 y techo MAX_POR_COMPRA, pero sobre "lineas" (setLineas).
        setLineas((prev) => 
                prev.map((linea) => {
                    if (linea.idEntrada === idEntrada) {
                        const nuevaCantidad = Math.min(MAX_POR_COMPRA, Math.max(0, linea.cantidad + cambio));
                        return { ...linea, cantidad: nuevaCantidad };
                    }
                    return linea;
                }).filter((linea) => linea.cantidad > 0)
        );    
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDatos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const continuarADatos = () => {
        // Pasar al paso "datos" (si todavía queda alguna entrada elegida).
        if (lineas.length > 0) {
            setPaso("datos");
        } 
    };

    const continuarAPago = (e: React.FormEvent) => {
        e.preventDefault();

        if (datos.email.trim().toLowerCase() !== datos.emailRepetido.trim().toLowerCase()) {
            setError("Los emails no coinciden");
            return;
        }
        if (!/^\d{7,8}$/.test(datos.dni)) {
            setError("El DNI debe tener 7 u 8 números, sin puntos");
            return;
        }
        // Si todo está bien, limpiar el error y pasar al paso "pago".
        setError("");
        setPaso("pago");
    };

    const pagar = async () => {
        if (enviandoRef.current) return;
        enviandoRef.current = true;
        setEnviando(true);
        setErrorPago("");
        try {
            const ordenCreada = await crearCompra({
                idEvento: Number(idEvento),
                // Solo id y cantidad: el precio y el total los calcula el backend.
                entradas: lineas.map((linea) => ({ idEntrada: linea.idEntrada, cantidad: linea.cantidad })),
                comprador: {
                    nombre: datos.nombre,
                    dni: datos.dni,
                    email: datos.email,
                    telefono: datos.telefono || undefined,
                },
            });
            setOrden(ordenCreada);
            setPaso("confirmacion");
        } catch (err) {
            setErrorPago(err instanceof Error ? err.message : "No se pudo registrar la compra");
        } finally {
            enviandoRef.current = false;
            setEnviando(false);
        }
    };

    // Salir cancela toda la compra. Si ya se escribió algo, se pide confirmación.
    const haEscritoDatos = Object.values(datos).some((valor) => valor !== "");
    const volverAlEvento = () => navigate(RUTAS.publico.detalle(idEvento ?? ""));
    const salir = () => (haEscritoDatos && paso !== "confirmacion" ? setConfirmandoSalir(true) : volverAlEvento());

    return (
        <main className="relative isolate flex-1 bg-gray-300 flex justify-center p-4 md:p-8">
            <FondoMosaico />

            <ContenedorDatos className="max-w-2xl h-fit p-6 md:p-8 gap-6">
                <header className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-noche pl-4 border-l-4 border-sol">{titulosPaso[paso]}</h1>
                        <Btn type="button" variant="cancel" size="sm" onClick={salir}>Volver al evento</Btn>
                    </div>
                    {/* Indicador de progreso: "Paso X de 3" */}
                </header>

                {paso === "resumen" && (
                    <ResumenCompra
                        lineas={lineas}
                        total={total}
                        onCambiarCantidad={cambiarCantidad}
                        onContinuar={continuarADatos}
                    />
                )}

                {paso === "datos" && (
                    <DatosCompradorForm
                        datos={datos}
                        onChange={handleChange}
                        error={error}
                        onVolver={() => setPaso("resumen")}
                        onContinuar={continuarAPago}
                    />
                )}

                {paso === "pago" && (
                    <PagoCompra
                        lineas={lineas}
                        total={total}
                        datos={datos}
                        enviando={enviando}
                        error={errorPago}
                        onPagar={pagar}
                        onVolver={() => setPaso("datos")}
                    />
                )}

                {/* Provisorio: cuando esté Mercado Pago, una orden Pendiente lleva al pago. */}
                {paso === "confirmacion" && orden && (
                    <div className="flex flex-col gap-4">
                        <p>Orden N° {orden.id}: {orden.estado === "Aprobada" ? "tus entradas quedaron confirmadas." : "quedó pendiente de pago."}</p>
                        <div className="flex justify-end">
                            <Btn type="button" onClick={volverAlEvento}>Volver al evento</Btn>
                        </div>
                    </div>
                )}
            </ContenedorDatos>

            <ConfirmarAccion
                isOpen={confirmandoSalir}
                title="Cancelar la compra"
                mensaje="Vas a perder los datos que cargaste, querés volver al evento"
                variante="danger"
                onConfirmar={volverAlEvento}
                onCancelar={() => setConfirmandoSalir(false)}
            />
        </main>
    );
};

export default CompraPage;
