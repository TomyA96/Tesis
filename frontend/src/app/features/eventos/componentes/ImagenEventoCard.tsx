import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { API_URL } from "../../../services/api";
import { buscarImagenesPorEvento, subirImagenEvento, type ImagenEvento } from "../../../services/imagenEventoService";
import { cn } from "../../../../lib/cn";
import type { EstadoEvento } from "../../../services/eventosService";

type ImagenEventoCardProps = {
    idEvento: number;
    estado: EstadoEvento;
};

const ImagenEventoCard = ({ idEvento, estado }: ImagenEventoCardProps) => {
    const [imagen, setImagen] = useState<ImagenEvento[] | null>(null);
    const [error, setError] = useState("");
    const bloqueado = estado === 'Finalizado' || estado === 'Cancelado'

    useEffect(() => {
        setError('')
        buscarImagenesPorEvento(idEvento)
            .then((response) => (setImagen(response)))
            .catch(() => setError("No se pudo cargar la imagen del evento"))
    }, [idEvento]);

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;
       
        setError('')
        subirImagenEvento(idEvento, archivo)
            .then((response) => setImagen([response]))
            .catch(() => setError("No se pudo subir la imagen"));
    };

    return (
        <ContenedorDatos>
            <Header titulo="Imagen del evento" />
            <div className="flex flex-col ">
                {/*
                    Los input de tipo file son elementos nativos del navegador:
                    su texto y botón no se pueden estilizar con CSS. Por eso el
                    input real queda oculto (sr-only) y el label asociado (que
                    sí es HTML común) hace de interfaz visual — clickear el
                    label abre el selector de archivos igual, sin JS extra.

                    El label además muestra tres estados distintos en el mismo
                    recuadro: la imagen ya cargada, un aviso si falló pedirla
                    (no sabemos si existe o no), o el placeholder si ya se
                    confirmó que no hay ninguna — así el mensaje de error ocupa
                    el mismo lugar que ocuparía la imagen, en vez de quedar
                    como una línea de texto suelta y desconectada.
                */}
                <label
                    htmlFor="imagen-evento-input"
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-80 rounded-lg cursor-pointer overflow-hidden border-2 border-dashed transition-colors",
                        imagen?.[0]
                            ? "border-gray-200"
                            : error
                            ? "border-red-300"
                            : "border-gray-300 hover:bg-gray-50 hover:border-gray-400",
                            bloqueado && 'cursor-not-allowed'
                    )}
                >
                    {imagen?.[0] ? (
                        <>
                            <img
                                src={`${API_URL}${imagen[0].url}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={() => {
                                    setImagen(null)
                                    setError("La imagen no se pudo cargar");
                                }}
                            />
                            <span className="absolute bottom-0 inset-x-0 py-1.5 text-center text-xs font-medium text-white bg-black/50">
                                Cambiar imagen
                            </span>
                        </>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-2 text-red-500 px-4 text-center">
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-sm">{error}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-sm">Seleccioná un archivo</span>
                        </div>
                    )}
                </label>
                <input
                    id="imagen-evento-input"
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSeleccionarArchivo}
                    disabled={bloqueado}
                />
            </div>
        </ContenedorDatos>
    );
};

export default ImagenEventoCard;
