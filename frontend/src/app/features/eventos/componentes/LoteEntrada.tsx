import Btn, { type Variant } from "../../../ui/componentes/Btn";
import type { Entrada, EstadoEntrada } from "../../../services/entradasService";
import Etiqueta, { type ColorEtiqueta } from "../../../ui/componentes/Etiqueta";
import type { AccionEntrada } from "../utils/accionesParaEntradas";
 
// ── TIPOS ──────────────────────────────────────────────────────────────────────

 const configAccion: Record<AccionEntrada, { label: string; variant: Variant; }> = {
    editar:       { label: "Editar",       variant: "outline",  },
    publicar:     { label: "Publicar",     variant: "success",  },
    habilitar:    { label: "Habilitar",    variant: "outline",  },
    deshabilitar: { label: "Deshabilitar", variant: "warning",  },
    eliminar:     { label: "Eliminar",     variant: "danger",   },
    imprimir:     { label: "Imprimir",     variant: "secondary", },
};
type LoteEntradaProps = {
    entrada: Entrada;
    // Callbacks — el componente avisa al padre qué acción se hizo
    // El padre decide qué hacer (abrir modal, llamar API, etc.)
    acciones: AccionEntrada[];
    cantidadTotal: number;
    cantidadVendida:number;
    onEditar: () => void;
    onPublicar: () => void;
    onHabilitar: () => void;
    onDeshabilitar: () => void;
    onEliminar: () => void;
    onImprimir: () => void;
};
 
// ── BADGE DE ESTADO ────────────────────────────────────────────────────────────
// Mismo patrón que en el resto del sistema
    
    const colorEstadoEtiqueta: Record<EstadoEntrada | "Impreso", ColorEtiqueta> = {
        Borrador:    "indigo",
        Disponible:  "verde",
        Impreso:     "azul",
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
const LoteEntrada = ({entrada, acciones, cantidadTotal, cantidadVendida, onEditar, onPublicar, onHabilitar, onDeshabilitar, onEliminar, onImprimir}: LoteEntradaProps) => {

    const handlers: Record<AccionEntrada, () => void> = {
        editar: onEditar,
        publicar: onPublicar,
        habilitar: onHabilitar,
        deshabilitar: onDeshabilitar,
        eliminar: onEliminar,
        imprimir: onImprimir,
    };

    return (
        <div className="flex justify-between items-center gap-6 border border-gray-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow duration-200">
 
            {/* ── DATOS DEL LOTE ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
 
                {/* Nombre + Badge en la misma fila */}
                <div className="flex items-center gap-3">
                    {/* h3 — es un subtítulo dentro de un componente, no título de página */}
                    <h3 className="font-semibold text-base text-gray-900 truncate">
                        {entrada.descripcion}
                    </h3>
                    <Etiqueta color={entrada.esFisica && entrada.cantidadTicket > 0 ? colorEstadoEtiqueta["Impreso"] : colorEstadoEtiqueta[entrada.estado]}>
                        {entrada.esFisica && entrada.cantidadTicket > 0 ? "Tickets Impresos" : entrada.estado}
                    </Etiqueta>
                </div>
 
                {/*
                    dl = description list — elemento HTML semántico para pares clave/valor
                    Es más correcto que usar h4 o div para este tipo de información
                */}
                <dl className="flex flex-col gap-1">
                    <FilaDato label="Cantidad">
                        {/* Barra de progreso visual para mostrar ocupación */}
                        <div className="flex items-center gap-2">
                            <span>{cantidadVendida}/{entrada.cantidad || cantidadTotal}</span>
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
                        }).format(entrada.precio)}
                    </FilaDato>
                </dl>
            </div>
 
            {/* ── ACCIONES ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
                {acciones.map((accion) =>
                    <Btn key={accion} size="sm" variant={configAccion[accion].variant} onClick={handlers[accion]}>
                        {configAccion[accion].label}
                    </Btn>
                )}
            </div>
     
        </div>
    );
};
 
export default LoteEntrada;