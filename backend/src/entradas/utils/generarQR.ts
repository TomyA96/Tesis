import * as QRCode from 'qrcode';

// Genera la imagen del QR (PNG, como Buffer) a partir de un texto — no se
// persiste en ningún lado, se recalcula al vuelo cada vez que hace falta,
// a partir del codigoQR que sí es la fuente de verdad guardada en la base.
export const generarQR = (texto: string): Promise<Buffer> => {
    return QRCode.toBuffer(texto);
};
