import { cn } from "../../../lib/cn";

/*
    Etiqueta (badge) de una sola línea para mostrar tipos y estados con color.

    El componente no sabe nada del dominio: recibe un color y un texto. Qué color
    le corresponde a cada concepto (que un Gasto sea rojo, que Bloqueado sea rojo)
    lo decide cada feature en su propio archivo de columnas.

    Criterio de colores, para que toda la app hable el mismo idioma visual:
    verde = activo o que suma · rojo = bloqueado o que resta · ámbar = mixto o
    intermedio · gris = neutro/apagado · azul = informativo.
*/
export type ColorEtiqueta = "verde" | "rojo" | "ambar" | "gris" | "azul" | "indigo";

const colores: Record<ColorEtiqueta, string> = {
    verde: "bg-emerald-50 text-emerald-700",
    rojo:  "bg-rose-50 text-rose-700",
    ambar: "bg-amber-50 text-amber-700",
    gris:  "bg-gray-100 text-gray-600",
    azul:  "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-900"
};

type EtiquetaProps = {
    color: ColorEtiqueta;
    children: React.ReactNode;
};

const Etiqueta = ({ color, children }: EtiquetaProps) => {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ",
                colores[color],
            )}
        >
            {children}
        </span>
    );
};

export default Etiqueta;
