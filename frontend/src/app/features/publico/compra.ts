// Tipos y valores compartidos por la página de compra y sus pasos.
// Viven en un archivo aparte para que ningún componente tenga que
// importarlos de la página (evita que se importen entre sí en círculo).

// Tope de entradas por tipo en una compra. Es solo una comodidad de la
// pantalla: el backend es quien tiene que validar la disponibilidad real.
export const MAX_POR_COMPRA = 10;

/*
    Una línea del resumen: un tipo de entrada con la cantidad elegida. Una
    compra puede tener entradas de varias jornadas, así que cada línea dice
    de cuál es ("General" del viernes y del sábado son entradas distintas).
*/
export type LineaCompra = {
    idEntrada: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    jornada: { id: number; titulo: string };
};

// Las líneas agrupadas por jornada, en el orden en que aparecen
export const agruparPorJornada = (lineas: LineaCompra[]) => {
    const grupos = new Map<number, { titulo: string; lineas: LineaCompra[] }>();
    for (const linea of lineas) {
        const grupo = grupos.get(linea.jornada.id) ?? { titulo: linea.jornada.titulo, lineas: [] };
        grupo.lineas.push(linea);
        grupos.set(linea.jornada.id, grupo);
    }
    return [...grupos.values()];
};

// Todo es string (es lo que devuelve un input), mismo criterio que EventoForm.
export type DatosComprador = {
    nombre: string;
    dni: string;
    email: string;
    emailRepetido: string;
    telefono: string;
};

export const datosVacios: DatosComprador = { nombre: "", dni: "", email: "", emailRepetido: "", telefono: "" };

export const totalDeLineas = (lineas: LineaCompra[]) =>
    lineas.reduce((suma, linea) => suma + linea.precioUnitario * linea.cantidad, 0);

export const cantidadDeLineas = (lineas: LineaCompra[]) => lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
