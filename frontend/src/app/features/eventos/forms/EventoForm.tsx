import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import type { ModoEventoPage } from "../pages/EventoPage";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react"; // npm install lucide-react (ya lo tenés)
 
type EventoFormProps = {
    modo: ModoEventoPage;
};
 
const EventoForm = ({ modo }: EventoFormProps) => {
    // Variable booleana para no repetir modo === "ver" en cada campo
    // Si el nombre del modo cambia algún día, lo cambiás en un solo lugar
    const esModoVer = modo === "ver";
 
    // ── ESTADO DE LA IMAGEN ───────────────────────────────────────────────────
    // preview: URL temporal de la imagen para mostrarla antes de subirla al servidor
    // null significa que no hay imagen seleccionada todavía
    const [preview, setPreview] = useState<string | null>(null);
 
    // dragging: true cuando el usuario arrastra un archivo encima del área
    // Lo usamos para cambiar los colores y dar feedback visual
    const [dragging, setDragging] = useState(false);
 
    // useRef: nos da acceso directo a un elemento del DOM
    // Lo necesitamos para poder abrir el selector de archivos al hacer click
    // en el área personalizada, sin mostrar el input file feo del navegador
    const inputRef = useRef<HTMLInputElement>(null);
 
    // ── FUNCIÓN PARA PROCESAR EL ARCHIVO ─────────────────────────────────────
    // Se llama tanto cuando el usuario elige desde el explorador
    // como cuando arrastra y suelta un archivo
    const handleArchivo = (file: File | null) => {
        if (!file) return;
        // Verificamos que sea imagen antes de procesar
        if (!file.type.startsWith("image/")) return;
 
        // URL.createObjectURL crea una URL temporal en memoria del navegador
        // para mostrar la imagen al instante, sin necesidad de subirla al servidor
        // Cuando conectes el backend, también enviás el File original al servidor
        setPreview(URL.createObjectURL(file));
    };
 
    // ── EVENTOS DRAG AND DROP ─────────────────────────────────────────────────
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();     // SIN esto, el navegador abre el archivo en una nueva pestaña
        setDragging(true);
    };
 
    const handleDragLeave = () => setDragging(false);
 
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        // e.dataTransfer.files contiene los archivos que el usuario soltó
        const file = e.dataTransfer.files[0];
        handleArchivo(file);
    };
 
    return (
        <Formulario autoComplete="off" className="p-6">
 
            {/* ── GRILLA DE CAMPOS ──────────────────────────────────────────── */}
            {/*
                grid-cols-2: dos columnas en pantallas medianas y más grandes
                gap-x-6: espacio horizontal entre las dos columnas
                En móvil (grid-cols-1) todos los campos van uno abajo del otro
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 
                {/*
                    md:col-span-2: este campo ocupa las DOS columnas
                    El nombre siempre se muestra — en modo ver está deshabilitado,
                    no desaparece. El usuario necesita ver qué evento está mirando.
                */}
                <div className="md:col-span-2">
                    
                </div>
 
                {/* Fecha y hora de inicio en la misma fila — son la misma información */}
                <div>
                    <Input
                        label="Nombre del Evento"
                        name="nombre"
                        type="text"
                        required
                        disabled={esModoVer}
                    />  
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fecha de Inicio" name="fechaIni" type="date" disabled={esModoVer} />
                        <Input label="Hora de Inicio"  name="horaIni"  type="time" disabled={esModoVer} />
                    </div>
                    
    
                    {/* Fecha y hora de fin en la misma fila */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fecha de Fin"    name="fechaFin" type="date" disabled={esModoVer} />
                        <Input label="Hora de Fin"     name="horaFin"  type="time" disabled={esModoVer} />
                    </div>
                    
    
                    <Input label="Lugar del Evento" name="lugar"     type="text"   disabled={esModoVer} />
                    <Input label="Capacidad"         name="capacidad" type="number" disabled={esModoVer} />
                </div>
                
 
                {/* Descripción ocupa las dos columnas */}
                <div className="md:col-span-2">
                    <Input label="Descripción" name="descripcion" type="textarea"  disabled={esModoVer} />
                </div>
 
            </div>
 
            {/* ── CAMPO DE IMAGEN ───────────────────────────────────────────── */}
            {/* Se muestra si estamos en modo edición, o si hay imagen cargada en modo ver */}
            {(!esModoVer || preview) && (
                <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        Imagen Promocional
                    </p>
 
                    {preview ? (
                        // ── PREVIEW ───────────────────────────────────────────
                        // Cuando hay imagen seleccionada, mostramos la preview
                        // overflow-hidden + rounded-lg: la imagen respeta el borde redondeado
                        <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
                            <img
                                src={preview}
                                alt="Preview del evento"
                                // object-cover: la imagen cubre el área sin deformarse ni estirarse
                                // h-48: altura fija de 192px
                                className="w-full h-48 object-cover"
                            />
                            {/* Botón para quitar la imagen — solo en modo edición */}
                            {!esModoVer && (
                                <button
                                    type="button"
                                    onClick={() => setPreview(null)}
                                    // absolute top-2 right-2: flota sobre la imagen en la esquina
                                    // rounded-full: lo hace circular
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                        </div>
 
                    ) : (
                        // ── ÁREA DE DRAG AND DROP ─────────────────────────────
                        // onClick abre el input file oculto usando inputRef
                        // onDragOver, onDragLeave, onDrop manejan el arrastre
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                w-full h-40 rounded-lg
                                border-2 border-dashed
                                flex flex-col items-center justify-center gap-2
                                cursor-pointer transition-colors duration-150
                                ${dragging
                                    // Feedback visual cuando el usuario arrastra un archivo encima
                                    ? "border-blue-400 bg-blue-50"
                                    // Estado normal
                                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                                }
                            `}
                        >
                            <ImagePlus className={`w-8 h-8 ${dragging ? "text-blue-400" : "text-gray-400"}`} />
                            <p className="text-sm text-gray-500 text-center">
                                <span className="font-medium text-gray-700">Hacé click</span> o arrastrá una imagen
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                        </div>
                    )}
 
                    {/*
                        Input file OCULTO — className="hidden" lo hace invisible
                        Lo abrimos programáticamente con inputRef.current?.click()
                        Así tenemos control total sobre el diseño del área de subida
                    */}
                    <input
                        ref={inputRef}
                        type="file"
                        name="imagen"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
                    />
                </div>
            )}
 
            {/* ── BOTONES ───────────────────────────────────────────────────── */}
            {!esModoVer && (
                // border-t separa visualmente la zona de acciones del formulario
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Btn
                        variant="cancel"
                        type="reset"
                        className="min-w-[140px]"
                        // type="reset" limpia los inputs del DOM,
                        // pero el preview está en estado React — lo limpiamos manualmente
                        onClick={() => setPreview(null)}
                    >
                        Cancelar
                    </Btn>
                    <Btn type="submit" className="min-w-[140px]">
                        Guardar Evento
                    </Btn>
                </div>
            )}
 
        </Formulario>
    );
};
 
export default EventoForm;