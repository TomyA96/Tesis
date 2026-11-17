import { createHmac, timingSafeEqual } from 'crypto';

/*
    Las entradas de una compra (con sus QR) solo las puede ver quien compró.
    El número de orden es correlativo (1, 2, 3...), así que no alcanza para
    pedirlas: cualquiera podría probar números y llevarse los QR de otros.

    La clave es una firma del número de orden hecha con un secreto que solo
    conoce el backend: se le da al comprador (en la URL de vuelta de Mercado
    Pago, o en la respuesta si la compra es gratuita) y el backend la vuelve
    a calcular para comprobarla. Sin el secreto no se puede inventar. No hace
    falta guardarla en la base.
*/
const secreto = () => {
    const valor = process.env.JWT_SECRET;
    if (!valor) {
        throw new Error('Falta JWT_SECRET para firmar las claves de las compras');
    }
    return valor;
};

export const claveDeOrden = (idOrden: number) =>
    createHmac('sha256', secreto()).update(`orden-compra:${idOrden}`).digest('base64url');

// timingSafeEqual compara sin cortar en el primer carácter distinto: así no se puede adivinar la clave midiendo cuánto tarda
export const esClaveDeOrden = (idOrden: number, clave: string) => {
    const esperada = Buffer.from(claveDeOrden(idOrden));
    const recibida = Buffer.from(clave);
    return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
};
