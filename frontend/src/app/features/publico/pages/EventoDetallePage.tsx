import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ImageOff, MapPin } from "lucide-react";
import { API_URL } from "../../../services/api";
import { getEventoPublicado, type EventoDetalle } from "../../../services/eventosService";
import { fechaArgentina, horaArgentina } from "../../../utils/zonaHoraria";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";
import FondoMosaico from "../../../ui/componentes/FondoMosaico";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import EntradaDetalle from "../componentes/EntradaDetalle";
import Btn from "../../../ui/componentes/Btn";
import { RUTAS } from "../../../constantes/Rutas";
import { MAX_POR_COMPRA } from "../compra";

const EventoDetallePage = () => {
    const { idEvento } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState<EventoDetalle | null>(null);
    const [error, setError] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, number>>({});

 
    const cambiarCantidad = (idEntrada: number, cambio: number) =>
        setCantidades((prev) => {
            const nueva = Math.min(MAX_POR_COMPRA, Math.max(0, (prev[idEntrada] ?? 0) + cambio));
            return { ...prev, [idEntrada]: nueva };
        });

    useEffect(() => {
       
        getEventoPublicado(Number(idEvento))
            .then((response) => setEvento(response))
            .catch(() => setError('Se produjo un error al cargar el evento'))
    }, [idEvento]);



    if (error) {
        return (
            <main className="flex-1 bg-gray-50 p-8">
                <p className="text-sm text-red-600">{error}</p>
            </main>
        );
    }

    if (!evento) {
        return (
            <main className="relative isolate flex-1 bg-gray-50 p-8">
                <FondoMosaico />
                <p className="text-sm text-gray-500">Cargando evento…</p>
            </main>
        );
    }

    const imagen = evento.imagenes[0];
    const { entradas } = evento;
    const total = entradas.reduce(
        (suma, e) => suma + Number(e.precio) * (cantidades[e.id] ?? 0), 0
    );

    // Solo las entradas con cantidad elegida, listas para mostrar en el resumen
    const lineas = entradas
        .filter((e) => (cantidades[e.id] ?? 0) > 0)
        .map((e) => ({
            idEntrada: e.id,
            descripcion: e.descripcion,
            cantidad: cantidades[e.id],
            precioUnitario: Number(e.precio),
        }));

    return (
        <main className="relative isolate flex-1 bg-gray-300 flex justify-center items-center p-4 md:p-8">
            <FondoMosaico />
            {/* ── PORTADA ─────────────────────────────────────────────────── */}
            {/* En celular: imagen arriba y datos abajo (flex-col). Desde tablet
                (md): imagen a la izquierda y datos a la derecha (md:flex-row). */}
            <ContenedorDatos className="max-w-6xl flex flex-col md:flex-row overflow-visible">

                
                <div className="relative h-64  md:h-[500px] md:w-1/2  md:sticky md:top-10 md:self-start rounded-2xl bg-white">
                    {imagen ? (
                        <img
                            src={`${API_URL}${imagen.url}`}
                            alt={evento.nombre}
                            className="absolute inset-0 w-full h-full object-cover md:rounded-2xl "
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <ImageOff className="w-10 h-10" />
                        </div>
                    )}
                </div>

                <div className="flex-1 px-6 py-8 md:px-8 md:py-10">
                    {/* ── INFORMACIÓN DEL EVENTO ──────────────────────────────── */}
                    <section className="flex flex-col gap-4 mb-6 ">
                        <h1 className="text-3xl font-bold text-noche pl-4 border-l-4 border-sol">{evento.nombre}</h1>

                        <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDays className="w-5 h-5 text-marca" />
                            <span>{fechaArgentina(evento.fechaHoraInicio)}</span>
                            <span>{horaArgentina(evento.fechaHoraInicio)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-marca" />
                            <span>{evento.ubicacion}</span>
                            {/* dirección, si tiene (evento.direccion puede ser null) */}
                        </div>

                        {/* Descripción, si tiene (evento.descripcion puede ser null) */}
                        {evento.descripcion && 
                            <div className=" text-white bg-gray-600 p-4 rounded-2xl">
                                <h4 className="font-semibold">Acerca del evento</h4>
                                <p className="text-sm">{evento.descripcion}</p>
                            </div>
                        }
                    </section>

                    {/* ── ENTRADAS ────────────────────────────────────────────── */}
                    <section className="flex flex-1 flex-col gap-4 h-fit">
                        <h2 className="text-xl font-semibold text-noche pl-4 border-l-4 border-sol">Entradas</h2>
                        {entradas.length > 0 ? (
                            
                            <>
                                <div className="md:max-h-88 md:overflow-y-auto flex flex-col gap-3">
                                    {entradas.map((entrada) =>
                                        <EntradaDetalle key={entrada.id} 
                                        entrada={entrada} 
                                        cantidad={cantidades[entrada.id] ?? 0} 
                                        onCambiarCantidad={(cambio) => cambiarCantidad(entrada.id, cambio)}/>
                                    )}
                                </div>
                                
                                {lineas.length > 0 && <div className="flex items-center justify-between">
                                    <span className="flex text-sm items-center border p-2 rounded-md border-gray-300">Total: 
                                        <p className="ml-4 text-sm font-semibold">{formatPrecioEntrada(total)}</p> 
                                    </span>
                                    <Btn
                                        size="lg"
                                        className="bg-acento hover:bg-acento-oscuro focus:ring-acento"
                                        onClick={() => navigate(RUTAS.publico.comprar(evento.id), { state: { lineas } })}
                                    >
                                        Comprar
                                    </Btn>

                                </div>}
                            </>
                        ) : (
                            <div>
                                <p>No hay entradas publicadas</p>
                            </div>
                        )}
                    </section>
                </div>
            </ContenedorDatos>
        </main>
    );
};

export default EventoDetallePage;
