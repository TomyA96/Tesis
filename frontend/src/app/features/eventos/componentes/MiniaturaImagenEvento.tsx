import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { API_URL } from "../../../services/api";
import { buscarImagenesPorEvento, subirImagenEvento } from "../../../services/imagenEventoService";
import { cn } from "../../../../lib/cn";

type MiniaturaImagenEventoProps = {
    idEvento: number;
    // Con el evento finalizado la imagen ya no se cambia
    bloqueado: boolean;
    // Avisa si el evento tiene imagen: la página lo necesita para avisar que falta para publicar
    onCambio: (tieneImagen: boolean) => void;
};

/*
    La imagen del evento en chico, para la cabecera del detalle. Mismo truco
    que ImagenEventoCard: el input file real queda oculto (sr-only) y el label
    asociado hace de recuadro clickeable, que muestra la imagen, el error o el
    placeholder en el mismo lugar.
*/
const MiniaturaImagenEvento = ({ idEvento, bloqueado, onCambio }: MiniaturaImagenEventoProps) => {
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setError("");
        setUrl(null);
        buscarImagenesPorEvento(idEvento)
            .then((imagenes) => {
                setUrl(imagenes[0]?.url ?? null);
                onCambio(imagenes.length > 0);
            })
            .catch(() => setError("No se pudo cargar la imagen"));
    }, [idEvento, onCambio]);

    const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        // Se vacía el input: así elegir el mismo archivo otra vez (por ejemplo, tras un error) vuelve a disparar onChange
        e.target.value = "";
        if (!archivo) return;

        setError("");
        subirImagenEvento(idEvento, archivo)
            .then((imagen) => {
                setUrl(imagen.url);
                onCambio(true);
            })
            .catch(() => setError("No se pudo subir la imagen"));
    };

    return (
        <div className="shrink-0">
            <label
                htmlFor="miniatura-imagen-evento"
                className={cn(
                    "relative flex h-40 w-64 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                    url ? "border-gray-200" : error ? "border-red-300" : "border-gray-300 hover:bg-gray-50",
                    bloqueado ? "cursor-not-allowed" : "cursor-pointer",
                )}
            >
                {url ? (
                    <>
                        <img
                            src={`${API_URL}${url}`}
                            alt="Imagen del evento"
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={() => {
                                setUrl(null);
                                setError("La imagen no se pudo mostrar");
                            }}
                        />
                        {!bloqueado && (
                            <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-xs font-medium text-white">
                                Cambiar imagen
                            </span>
                        )}
                    </>
                ) : (
                    <span
                        className={cn(
                            "flex flex-col items-center gap-1 px-2 text-center text-xs",
                            error ? "text-red-500" : "text-gray-500",
                        )}
                    >
                        <ImagePlus className="h-5 w-5" />
                        {error || "Subir imagen"}
                    </span>
                )}
            </label>
            <input
                id="miniatura-imagen-evento"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleArchivo}
                disabled={bloqueado}
            />
        </div>
    );
};

export default MiniaturaImagenEvento;
