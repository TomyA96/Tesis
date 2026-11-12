import Btn, { type Variant } from "../../../ui/componentes/Btn";
import { formatPrecioEntrada } from "../../../utils/formatoPrecio";
import type { Entrada } from "../../../services/entradasService";
import Etiqueta, { type ColorEtiqueta } from "../../../ui/componentes/Etiqueta";
import type { AccionEntrada } from "../utils/accionesParaEntradas";

// ── TIPOS ──────────────────────────────────────────────────────────────────────

const configAccion: Record<AccionEntrada, { label: string; variant: Variant; }> = {
    editar:       { label: "Editar",        variant: "outline",  },
    publicar:     { label: "Publicar",      variant: "success",  },
    imprimir:     { label: "Imprimir lote", variant: "secondary", },
    habilitar:    { label: "Habilitar",     variant: "outline",  },
    deshabilitar: { label: "Deshabilitar",  variant: "warning",  },
    anular:       { label: "Anular lote",   variant: "danger",   },
    tickets:      { label: "Ver tickets",   variant: "outline",  },
    eliminar:     { label: "Eliminar",      variant: "danger",   },
};

type LoteEntradaProps = {
    entrada: Entrada;
    // El padre decide qué acciones van y qué hace cada una (abrir modal, llamar API, etc.)
    acciones: AccionEntrada[];
    onAccion: (accion: AccionEntrada) => void;
};

// ── ETIQUETA DE ESTADO ─────────────────────────────────────────────────────────
/*
    El estado guardado es Borrador, Disponible o Anulado, pero "Disponible"
    se lee distinto según el tipo: un lote online está publicado (o con la
    venta pausada) y uno físico, impreso.
*/
const etiquetaDe = (entrada: Entrada): { texto: string; color: ColorEtiqueta } => {
    if (entrada.estado === "Borrador") return { texto: "Borrador", color: "indigo" };
    if (entrada.estado === "Anulado") return { texto: "Anulado", color: "gris" };
    if (entrada.esFisica) return { texto: "Impreso", color: "azul" };
    return entrada.habilitada ? { texto: "Publicado", color: "verde" } : { texto: "Venta pausada", color: "ambar" };
};

// ── FILA DE DATO ───────────────────────────────────────────────────────────────
/*
    Componente interno para mostrar un par label/valor.
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
const LoteEntrada = ({ entrada, acciones, onAccion }: LoteEntradaProps) => {
    const etiqueta = etiquetaDe(entrada);
    /*
        Lo vendido solo lo sabe el sistema en las online. Las físicas se venden
        en los puntos de venta y se van a conocer en la rendición de cuentas.
    */
    const muestraVendidos = !entrada.esFisica && entrada.estado !== "Borrador";
    // Una física impresa se reparte: dónde está cada ticket importa más que el total
    const muestraReparto = entrada.esFisica && entrada.estado !== "Borrador";

    return (
        <div className="flex justify-between items-center gap-6 border border-gray-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow duration-200">

            {/* ── DATOS DEL LOTE ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">

                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-base text-gray-900 truncate">
                        {entrada.descripcion}
                    </h3>
                    <Etiqueta color={etiqueta.color}>{etiqueta.texto}</Etiqueta>
                    <span className="text-xs text-gray-400">{entrada.esFisica ? "Física" : "Online"}</span>
                </div>

                <dl className="flex flex-col gap-1">
                    {muestraVendidos ? (
                        <FilaDato label="Vendidas">
                            <div className="flex items-center gap-2">
                                <span>{entrada.vendidos}/{entrada.cantidad}</span>
                                {/*
                                    style inline solo para el width dinámico: Tailwind no
                                    puede generar clases con valores calculados en runtime
                                */}
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all"
                                        style={{ width: `${Math.min((entrada.vendidos / entrada.cantidad) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </FilaDato>
                    ) : muestraReparto ? (
                        <FilaDato label="Tickets">
                            <span className="text-gray-500">
                                {entrada.cantidad} · en mano {entrada.enMano} · en locales {entrada.enLocales} · vendidos {entrada.vendidos}
                            </span>
                        </FilaDato>
                    ) : (
                        <FilaDato label="Tickets">{entrada.cantidad}</FilaDato>
                    )}

                    {entrada.anulados > 0 && (
                        <FilaDato label="Anulados">{entrada.anulados}</FilaDato>
                    )}

                    <FilaDato label="Precio">
                        {/* Pesos enteros ($6.000 en lugar de 6000); si es gratuita muestra "Gratis" */}
                        {formatPrecioEntrada(entrada.precio)}
                    </FilaDato>
                </dl>
            </div>

            {/* ── ACCIONES ──────────────────────────────────────────────────── */}
            {acciones.length > 0 && (
                <div className="flex flex-col gap-2">
                    {acciones.map((accion) =>
                        <Btn key={accion} size="sm" variant={configAccion[accion].variant} onClick={() => onAccion(accion)}>
                            {configAccion[accion].label}
                        </Btn>
                    )}
                </div>
            )}

        </div>
    );
};

export default LoteEntrada;
