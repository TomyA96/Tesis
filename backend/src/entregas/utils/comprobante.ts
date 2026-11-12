import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';
import { agruparEnTramos } from './tramos';

export type DatosComprobante = {
    id: number;
    fechaHora: Date;
    evento: string;
    puntoVenta: { nombre: string; telefono: string | null };
    usuario: string;
    observacion: string | null;
    // Si es mayor a la cantidad actual, la entrega se corrigió después de registrarla
    cantidadOriginal: number;
    lotes: {
        descripcion: string;
        jornada: { nombre: string | null; fechaHoraInicio: Date };
        precio: Prisma.Decimal;
        numeros: number[];
    }[];
};

const ZONA = 'America/Argentina/Buenos_Aires';
const fecha = (d: Date) => d.toLocaleDateString('es-AR', { timeZone: ZONA });
const fechaHora = (d: Date) =>
    `${fecha(d)} ${d.toLocaleTimeString('es-AR', { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}`;
const pesos = (monto: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

// "#151 al #250, #260 al #262, #270"
const textoTramos = (numeros: number[]) =>
    agruparEnTramos(numeros)
        .map((t) => (t.desde === t.hasta ? `#${t.desde}` : `#${t.desde} al #${t.hasta}`))
        .join(', ');

/*
    Comprobante de entrega en A4: qué tickets se le dieron al local, cuánto
    valen y dos firmas. El local se queda con una copia; cuando viene a
    rendir, se compara contra esto.
*/
export const comprobanteEntregaPDF = (datos: DatosComprobante): Promise<Buffer> => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    const ancho = doc.page.width - 100;
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const terminado = new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    // ── Encabezado ─────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(18).text('Comprobante de entrega de tickets');
    doc.font('Helvetica').fontSize(10).fillColor('#555').text(`Entrega Nº ${datos.id} · ${fechaHora(datos.fechaHora)}`);

    /*
        Si después de registrarla se le quitaron tickets (o pasaron a otro
        local), el comprobante muestra los que siguen y lo avisa: el papel
        que se firmó al principio decía otra cantidad.
    */
    const actuales = datos.lotes.reduce((suma, l) => suma + l.numeros.length, 0);
    if (actuales < datos.cantidadOriginal) {
        doc.moveDown(0.5).font('Helvetica-Bold').fontSize(10).fillColor('#b45309').text(
            actuales === 0
                ? `Entrega anulada: originalmente ${datos.cantidadOriginal} tickets, todos se quitaron o pasaron a otro local.`
                : `Entrega corregida: originalmente ${datos.cantidadOriginal} tickets; se muestran los ${actuales} que siguen en esta entrega.`,
        );
    }
    doc.moveDown(1.2).fillColor('#000');

    const dato = (etiqueta: string, valor: string) => {
        doc.font('Helvetica-Bold').fontSize(11).text(`${etiqueta}: `, { continued: true });
        doc.font('Helvetica').text(valor);
    };
    dato('Evento', datos.evento);
    dato('Punto de venta', datos.puntoVenta.nombre + (datos.puntoVenta.telefono ? ` · Tel. ${datos.puntoVenta.telefono}` : ''));
    dato('Entregó', datos.usuario);
    doc.moveDown(1);

    // ── Tabla ──────────────────────────────────────────────────────────────
    const columnas = [
        { titulo: 'Jornada', ancho: 95 },
        { titulo: 'Lote', ancho: 110 },
        { titulo: 'Cant.', ancho: 40, derecha: true },
        { titulo: 'Números', ancho: 140 },
        { titulo: 'Precio', ancho: 55, derecha: true },
        { titulo: 'Valor', ancho: ancho - 440, derecha: true },
    ];
    const xInicial = doc.page.margins.left;

    const fila = (celdas: string[], negrita = false) => {
        doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
        // La fila mide lo que mida su celda más alta (los números pueden ocupar varias líneas)
        const alto = Math.max(...celdas.map((texto, i) => doc.heightOfString(texto, { width: columnas[i].ancho - 6 })));
        if (doc.y + alto > doc.page.height - doc.page.margins.bottom - 120) doc.addPage();
        const y = doc.y;
        let x = xInicial;
        celdas.forEach((texto, i) => {
            doc.text(texto, x + 3, y, { width: columnas[i].ancho - 6, align: columnas[i].derecha ? 'right' : 'left' });
            x += columnas[i].ancho;
        });
        doc.y = y + alto + 6;
        doc.moveTo(xInicial, doc.y - 3).lineTo(xInicial + ancho, doc.y - 3).strokeColor('#ddd').stroke();
    };

    fila(columnas.map((c) => c.titulo), true);

    let totalTickets = 0;
    let totalValor = 0;
    for (const lote of datos.lotes) {
        const precio = lote.precio.toNumber();
        const valor = precio * lote.numeros.length;
        totalTickets += lote.numeros.length;
        totalValor += valor;
        fila([
            `${lote.jornada.nombre ?? 'Jornada'} · ${fecha(lote.jornada.fechaHoraInicio)}`,
            lote.descripcion,
            String(lote.numeros.length),
            textoTramos(lote.numeros),
            precio === 0 ? 'Gratis' : pesos(precio),
            pesos(valor),
        ]);
    }
    fila(['', 'Total', String(totalTickets), '', '', pesos(totalValor)], true);

    if (datos.observacion) {
        doc.moveDown(0.8);
        doc.font('Helvetica-Bold').fontSize(10).text('Observación: ', xInicial, doc.y, { continued: true });
        doc.font('Helvetica').text(datos.observacion);
    }

    // ── Firmas ─────────────────────────────────────────────────────────────
    const yFirmas = Math.max(doc.y + 70, doc.page.height - 160);
    const anchoFirma = 200;
    [
        { x: xInicial, texto: 'Entrega (organizador)' },
        { x: xInicial + ancho - anchoFirma, texto: 'Recibe (punto de venta)' },
    ].forEach(({ x, texto }) => {
        doc.moveTo(x, yFirmas).lineTo(x + anchoFirma, yFirmas).strokeColor('#000').stroke();
        doc.font('Helvetica').fontSize(9).fillColor('#555').text(texto, x, yFirmas + 5, { width: anchoFirma, align: 'center' });
        doc.text('Aclaración y fecha', x, yFirmas + 18, { width: anchoFirma, align: 'center' });
    });

    doc.end();
    return terminado;
};
