// Un tramo de números consecutivos: del 151 al 250
export type Tramo = { desde: number; hasta: number };

// [1,2,3,7,8,10] → [{1..3}, {7..8}, {10..10}]
export const agruparEnTramos = (numeros: number[]): Tramo[] => {
    const ordenados = [...numeros].sort((a, b) => a - b);
    const tramos: Tramo[] = [];
    for (const n of ordenados) {
        const ultimo = tramos[tramos.length - 1];
        if (ultimo && n === ultimo.hasta + 1) ultimo.hasta = n;
        else tramos.push({ desde: n, hasta: n });
    }
    return tramos;
};
