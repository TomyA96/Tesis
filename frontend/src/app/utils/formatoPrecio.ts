const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
});

export const formatPrecio = (value: number) => {
    return formatoPrecio.format(value);
};

// Las entradas se venden en pesos enteros, sin centavos ($ 6.000).
const formatoPesosEnteros = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

export const formatPesosEnteros = (value: number) => {
    return formatoPesosEnteros.format(value);
};

// Las entradas pueden ser gratuitas (precio 0): en vez de "$ 0" se muestra "Gratis".
export const formatPrecioEntrada = (value: number) => {
    return value === 0 ? "Gratis" : formatPesosEnteros(value);
};
