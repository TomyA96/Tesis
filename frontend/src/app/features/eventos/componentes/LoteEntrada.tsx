

import Btn from "../../../ui/componentes/Btn";
import { cn } from "../../../../lib/cn";
 
// ── TIPOS ──────────────────────────────────────────────────────────────────────
type TipoEntrada  = "online" | "fisica";
type EstadoLote   = "borrador" | "publicado" | "deshabilitado";
 
type LoteEntradaProps = {
    nombre:      string;
    cantidadVendida:    number;    // vendidas
    cantidadTotal:   number;    // total
    precio:      number;
    estado:      EstadoLote;
    tipoEntrada: TipoEntrada;
    // Callbacks — el componente avisa al padre qué acción se hizo
    // El padre decide qué hacer (abrir modal, llamar API, etc.)
    onEditar?:    () => void;
    onDeshabilitar?: () => void;
    onEliminar?: () => void;   // opcional — física no tiene eliminar
    onPublicar?: () => void;   // opcional — solo online
    onImprimir?: () => void;   // opcional — solo física
};
 
// ── BADGE DE ESTADO ────────────────────────────────────────────────────────────
// Mismo patrón que en el resto del sistema
const BadgeEstadoLote = ({ estado }: { estado: EstadoLote }) => {
    const estilos: Record<EstadoLote, string> = {
        borrador:      "bg-gray-100    text-gray-600",
        publicado:     "bg-emerald-100 text-emerald-700",
        deshabilitado: "bg-red-100     text-red-600",
    };
 
    const etiquetas: Record<EstadoLote, string> = {
        borrador:      "Borrador",
        publicado:     "Publicado",
        deshabilitado: "Deshabilitado",
    };
 
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            estilos[estado]
        )}>
            {etiquetas[estado]}
        </span>
    );
};
 
// ── FILA DE DATO ───────────────────────────────────────────────────────────────
/*
    Componente interno para mostrar un par label/valor.
    Reemplaza el uso incorrecto de h4 como contenedor de layout.
    dl/dt/dd es la forma semánticamente correcta para listas de definición
    (pares clave-valor como "Precio: $6.000")
*/
const FilaDato = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
        <dt className="text-sm text-gray-500">{label}</dt>
        <dd className="text-sm font-medium text-gray-800">{children}</dd>
    </div>
);
 
// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
const LoteEntrada = ({
    nombre,
    cantidadVendida,
    cantidadTotal,
    precio,
    estado,
    tipoEntrada,
    onEditar,
    onEliminar,
    onPublicar,
    onImprimir,
}: LoteEntradaProps) => {
 
    const esOnline = tipoEntrada === "online";
 
    return (
        <div className="flex justify-between items-center gap-6 border border-gray-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow duration-200">
 
            {/* ── DATOS DEL LOTE ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
 
                {/* Nombre + Badge en la misma fila */}
                <div className="flex items-center gap-3">
                    {/* h3 — es un subtítulo dentro de un componente, no título de página */}
                    <h3 className="font-semibold text-base text-gray-900 truncate">
                        {nombre}
                    </h3>
                    <BadgeEstadoLote estado={estado} />
                </div>
 
                {/*
                    dl = description list — elemento HTML semántico para pares clave/valor
                    Es más correcto que usar h4 o div para este tipo de información
                */}
                <dl className="flex flex-col gap-1">
                    <FilaDato label="Cantidad">
                        {/* Barra de progreso visual para mostrar ocupación */}
                        <div className="flex items-center gap-2">
                            <span>{cantidadVendida}/{cantidadTotal}</span>
                            {/*
                                La barra muestra visualmente qué porcentaje está vendido
                                style inline solo para el width dinámico — Tailwind no
                                puede generar clases con valores dinámicos en runtime
                            */}
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${Math.min((cantidadVendida / cantidadTotal) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </FilaDato>
 
                    <FilaDato label="Precio">
                        {/* 
                            Intl.NumberFormat formatea el número como moneda argentina
                            $6.000 en lugar de 6000
                        */}
                        {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                        }).format(precio)}
                    </FilaDato>
                </dl>
            </div>
 
            {/* ── ACCIONES ──────────────────────────────────────────────────── */}
            {/*
                Editar es común a los dos tipos — se muestra siempre.
                El resto de botones depende del tipoEntrada.
                Esto evita repetir el botón Editar en dos bloques distintos.
            */}
            <div className="flex flex-col gap-2">
                <Btn variant="outline" size="sm" onClick={onEditar}>
                    Editar Lote
                </Btn>
 
                {/* Botones exclusivos de online */}
                {esOnline && (
                    <>
                        <Btn
                            variant="success"
                            size="sm"
                            onClick={onPublicar}
                        >
                            {estado === "publicado" ? "Deshabilitar" : "Publicar"}
                        </Btn>
                        <Btn
                            variant="danger"
                            size="sm"
                            onClick={onEliminar}
                        >
                            Eliminar Lote
                        </Btn>
                    </>
                )}
 
                {/* Botones exclusivos de física */}
                {!esOnline && (
                    <Btn
                        variant="outline"
                        size="sm"
                        onClick={onImprimir}
                    >
                        Imprimir
                    </Btn>
                )}
            </div>
 
        </div>
    );
};
 
export default LoteEntrada;