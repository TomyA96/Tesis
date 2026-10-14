// Tipos y valores compartidos por la página de compra y sus pasos.
// Viven en un archivo aparte para que ningún componente tenga que
// importarlos de la página (evita que se importen entre sí en círculo).

// Tope de entradas por tipo en una compra. Es solo una comodidad de la
// pantalla: el backend es quien tiene que validar la disponibilidad real.
export const MAX_POR_COMPRA = 10;

// Una línea del resumen: un tipo de entrada con la cantidad elegida.
export type LineaCompra = {
    idEntrada: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
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
