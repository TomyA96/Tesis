import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "../../../../lib/cn";

type SelectorImagenProps = {
    // El archivo elegido todavía no se sube: el padre lo guarda hasta que el evento exista
    archivo: File | null;
    onChange: (archivo: File | null) => void;
};

/*
    Elegir la imagen del evento al crearlo. El archivo se sube DESPUÉS de crear
    el evento, con subirImagenEvento(idEvento, archivo), porque el backend
    necesita el id del evento. Es opcional: solo hace falta para publicar.

    Mismo recuadro que ImagenEventoCard (el del detalle), pero sin tocar el
    servidor: la vista previa sale del archivo local.
*/
const SelectorImagen = ({ archivo, onChange }: SelectorImagenProps) => {
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

    /*
        createObjectURL reserva memoria hasta que se libera con revokeObjectURL.
        Va en un efecto (y no en el render) para liberar la URL anterior cada
        vez que cambia el archivo y al desmontar el componente.
    */
    useEffect(() => {
        if (!archivo) {
            setVistaPrevia(null);
            return;
        }
        const url = URL.createObjectURL(archivo);
        setVistaPrevia(url);
        return () => URL.revokeObjectURL(url);
    }, [archivo]);

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const elegido = e.target.files?.[0];
        if (!elegido) return;
        onChange(elegido);
        // Sin esto, volver a elegir el mismo archivo después de quitarlo no dispara onChange
        e.target.value = "";
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Imagen del evento (opcional)</span>

            {/*
                El input real queda oculto (sr-only) y el label hace de interfaz:
                clickearlo abre el selector de archivos igual, sin JS extra.
            */}
            <label
                htmlFor="imagen-evento-nueva"
                className={cn(
                    "relative flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                    vistaPrevia ? "border-gray-200" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
                )}
            >
                {vistaPrevia ? (
                    <>
                        <img src={vistaPrevia} alt="Vista previa" className="absolute inset-0 h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1.5 text-center text-xs font-medium text-white">
                            Cambiar imagen
                        </span>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-sm">Subir imagen</span>
                    </div>
                )}
            </label>
            <input
                id="imagen-evento-nueva"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleSeleccionarArchivo}
            />

            {archivo && (
                <button
                    type="button"
                    className="cursor-pointer self-start text-xs text-red-600 hover:underline"
                    onClick={() => onChange(null)}
                >
                    Quitar imagen
                </button>
            )}
        </div>
    );
};

export default SelectorImagen;
