import PDFDocument from 'pdfkit';
import { generarQR } from './generarQR';

/*
    El PDF de tickets para imprimir: una página cuadrada por ticket con el
    nombre del evento, el QR, el número con la fecha de la jornada y el
    nombre del lote. Lo usan la impresión de un lote físico (todos sus
    tickets de una vez) y la boletería (los de cada venta en puerta).
*/
export type DatosPdfTickets = {
    evento: string;
    // El nombre del lote: "General", "VIP", "General Boletería"...
    descripcion: string;
    // Los tickets de distintas jornadas del mismo evento se distinguen por la fecha impresa
    fechaJornada: Date;
};

const centrarX = (doc: PDFKit.PDFDocument, texto: string, anchoPagina: number) =>
    (anchoPagina - doc.widthOfString(texto)) / 2;

// Achica la letra hasta que el texto entre en el ancho (sin bajar del mínimo)
const ajustarFontSize = (doc: PDFKit.PDFDocument, texto: string, anchoMaximo: number, tamanoInicial: number, tamanoMinimo: number) => {
    let tamano = tamanoInicial;
    doc.fontSize(tamano);
    while (doc.widthOfString(texto) > anchoMaximo && tamano > tamanoMinimo) {
        tamano--;
        doc.fontSize(tamano);
    }
    return tamano;
};

export const pdfDeTickets = async (datos: DatosPdfTickets, tickets: { numero: string; codigoQR: string }[]): Promise<Buffer> => {
    const conQR = await Promise.all(tickets.map(async (ticket) => ({ ticket, qr: await generarQR(ticket.codigoQR) })));

    const fecha = datos.fechaJornada.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
    });

    const doc = new PDFDocument({ autoFirstPage: false });
    for (const { ticket, qr } of conQR) {
        doc.addPage({ size: [300, 300], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
        doc.font('Helvetica-Bold');
        ajustarFontSize(doc, datos.evento, 280, 18, 10);
        doc.text(datos.evento, centrarX(doc, datos.evento, 300), 20);
        doc.image(qr, (300 - 200) / 2, 50, { width: 200, height: 200 });
        const numeroYFecha = `#${ticket.numero} - ${fecha}`;
        doc.font('Helvetica-Bold').fontSize(12).text(numeroYFecha, centrarX(doc, numeroYFecha, 300), 250);
        ajustarFontSize(doc, datos.descripcion, 280, 10, 8);
        doc.font('Helvetica').fontSize(12).text(datos.descripcion, centrarX(doc, datos.descripcion, 300), 263);
    }

    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.end();
    });
};
