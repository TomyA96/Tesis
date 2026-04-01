import type { ReactNode } from "react";

// Esta función es pura — dado los mismos parámetros, siempre devuelve lo mismo
// No depende de ningún estado ni contexto externo
// Se puede testear de forma aislada sin montar ningún componente
export const renderCelda = (
    col: string,
    value: any,
    cellRenderers?: Partial<Record<string, (value: any) => ReactNode>>
): ReactNode => {
    if (col === "id")          return String(value).padStart(3, "0");
    if (value instanceof Date) return value.toLocaleString("es-AR");
    if (cellRenderers?.[col])  return cellRenderers[col]!(value);
    return value;
};