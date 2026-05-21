
const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
});

export const formatPrecio = (value: number) => {
    return formatoPrecio.format(value);
};