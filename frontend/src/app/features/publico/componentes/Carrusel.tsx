import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RUTAS } from "../../../constantes/Rutas";
import { API_URL } from "../../../services/api";
import type { EventoConImagenes } from "../../../services/eventosService";
import { cn } from "../../../../lib/cn";

type CarruselProps = {
    eventos: EventoConImagenes[];
    errorDeCarga: string;
};

const INTERVALO_AUTOPLAY_MS = 5000;

const armarSlides = (eventos: EventoConImagenes[]): EventoConImagenes[] => {
    if (eventos.length === 0){
        return []
    }
    return eventos;
};

const Carrusel = ({ eventos, errorDeCarga }: CarruselProps) => {
    const slides = armarSlides(eventos);
    const [indiceActual, setIndiceActual] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setIndiceActual((prev) => (prev + 1) % slides.length);
        }, INTERVALO_AUTOPLAY_MS);

        return () => clearInterval(id);
    }, [slides.length]);

    const irAAnterior = () => {
        
        setIndiceActual((prev) => (prev - 1 + slides.length) % slides.length )
    };

    const irASiguiente = () => {
        
        setIndiceActual((prev) => (prev + 1 + slides.length) % slides.length )
    };

    if (errorDeCarga) {
        return (
            <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 text-red-600 text-sm">
                {errorDeCarga}
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                No hay eventos publicados por el momento.
            </div>
        );
    }

    const slideActual = slides[indiceActual];
   
    return (
        <div className="relative w-full h-[420px] overflow-hidden">
            {slides.map((_ , i) => (
                <img
                    key={i}
                    src={`${API_URL}${slides[i].imagenes[0]?.url}`}
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                        i === indiceActual ? "opacity-100" : "opacity-0"
                    )}
                />
            ))}

            {/* Capa clickeable sobre toda la imagen. Va antes de las flechas y
                los puntos en el DOM, así esos quedan por encima y siguen
                recibiendo sus propios clicks. */}
            <Link
                to={RUTAS.publico.detalle(slideActual.id)}
                aria-label={`Ver ${slideActual.nombre}`}
                className="absolute inset-0"
            />

            {/* Franja con nombre/fecha, siempre visible (no depende de hover).
                pointer-events-none: deja pasar el click a la capa de arriba. */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-linear-to-t from-noche/85 to-transparent text-white pointer-events-none">
                <h2 className="text-xl font-bold">{slideActual.nombre}</h2>
            </div>

            {/* Flechas flotando sobre la imagen, no ocupan espacio propio */}
            <button
                onClick={irAAnterior}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-noche/50 p-2 text-white hover:bg-marca cursor-pointer transition-colors"
            >
                <ChevronLeft />
            </button>
            <button
                onClick={irASiguiente}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-noche/50 p-2 text-white hover:bg-marca cursor-pointer transition-colors"
            >
                <ChevronRight />
            </button>

            {/* Puntos — uno por slide, el del índice actual con estilo distinto */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 ">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndiceActual(i)}
                        className={cn("w-2 h-2 rounded-full bg-white/60 cursor-pointer hover:bg-white", (indiceActual === i) && 'bg-sol w-4 hover:bg-sol')}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carrusel;
