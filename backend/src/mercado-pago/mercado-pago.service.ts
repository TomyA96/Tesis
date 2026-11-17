import { BadGatewayException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { claveDeOrden } from '../compras/utils/clave-orden';

const URL_API = 'https://api.mercadopago.com';

// Un renglón de lo que se cobra: se le muestra al cliente en la pantalla de pago de Mercado Pago.
export type ItemOrder = {
    titulo: string;
    cantidad: number;
    precioUnitario: Prisma.Decimal;
};

export type DatosOrder = {
    // Nuestra orden de compra: Mercado Pago la devuelve en cada aviso, así sabemos de cuál se trata.
    idOrden: number;
    total: Prisma.Decimal;
    emailComprador: string;
    items: ItemOrder[];
    // Cuánto tiempo puede tardar el cliente en pagar: igual que lo que dura la reserva de sus entradas.
    minutosVigencia: number;
};

// De toda la respuesta de Mercado Pago solo guardamos lo que usamos.
export type OrderCreada = {
    idOrdenMercadoPago: string;
    urlPago: string;
};

// El estado de una order tal como lo informa Mercado Pago.
export type EstadoOrderMercadoPago = {
    // created, processed, canceled, failed, refunded...
    status: string;
    // accredited (pago acreditado), etc.
    statusDetail: string;
    totalAmount: string;
};

/*
    Todo lo que hable con Mercado Pago vive acá. El resto del sistema no sabe
    de URLs, headers ni nombres de campos de su API: si cambia, se toca un
    solo archivo.
*/
@Injectable()
export class MercadoPagoService {
    private readonly logger = new Logger(MercadoPagoService.name);

    // El token se pide cada vez que se usa: si falta, el error aparece justo donde hace falta
    private token() {
        const token = process.env.ACCESS_TOKEN_MERCADOPAGO;
        if (!token) {
            // Falta configurar el servidor: no es un error del cliente
            throw new InternalServerErrorException('Falta configurar ACCESS_TOKEN_MERCADOPAGO');
        }
        return token;
    }

    /*
        Le pide a Mercado Pago que prepare un cobro y nos devuelve el link al
        que hay que mandar al cliente para que pague.
    */
    async crearOrder(datos: DatosOrder): Promise<OrderCreada> {
        // A dónde vuelve el cliente después de pagar. Los tres casos (aprobado, pendiente,
        // rechazado) van a la misma pantalla: ella consulta el estado real a nuestro backend.
        // La clave le permite ver sus entradas con los QR (ver utils/clave-orden).
        const frontend = process.env.FRONTEND_URL ?? 'http://localhost:5173';
        const urlRetorno = `${frontend}/compra/resultado?orden=${datos.idOrden}&clave=${claveDeOrden(datos.idOrden)}`;

        // Mercado Pago pide los montos como texto con dos decimales ("1000.00")
        const cuerpo = {
            type: 'online',
            processing_mode: 'manual',
            total_amount: datos.total.toFixed(2),
            external_reference: String(datos.idOrden),
            expiration_time: `PT${datos.minutosVigencia}M`,
            payer: { email: datos.emailComprador },
            items: datos.items.map((item) => ({
                title: item.titulo,
                quantity: item.cantidad,
                unit_price: item.precioUnitario.toFixed(2),
            })),
            config: {
                online: {
                    success_url: urlRetorno,
                    failure_url: urlRetorno,
                    pending_url: urlRetorno,
                    auto_return: 'approved',
                },
            },
        };

        let respuesta: Response;
        try {
            respuesta = await fetch(`${URL_API}/v1/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token()}`,
                    'Content-Type': 'application/json',
                    // Un valor distinto por pedido: si por un error de red se repitiera, Mercado Pago no crearía dos cobros
                    'X-Idempotency-Key': randomUUID(),
                },
                body: JSON.stringify(cuerpo),
                // Que un Mercado Pago colgado no deje al cliente esperando para siempre
                signal: AbortSignal.timeout(15000),
            });
        } catch (error) {
            this.logger.error(`No se pudo comunicar con Mercado Pago: ${error}`);
            throw new BadGatewayException('No se pudo generar el link de pago. Probá de nuevo en un momento');
        }

        const respuestaJson = await respuesta.json().catch(() => null);

        if (!respuesta.ok || !respuestaJson?.id || !respuestaJson?.checkout_url) {
            // El detalle va al log del servidor; al cliente no se le muestra el error interno
            this.logger.error(`Mercado Pago rechazó la order (${respuesta.status}): ${JSON.stringify(respuestaJson)}`);
            throw new BadGatewayException('No se pudo generar el link de pago. Probá de nuevo en un momento');
        }

        return {
            idOrdenMercadoPago: respuestaJson.id,
            urlPago: respuestaJson.checkout_url,
        };
    }

    /*
        Le pregunta a Mercado Pago cómo está una order. Es la fuente de verdad:
        ni el aviso (webhook) ni los datos con los que el cliente vuelve a la
        web son confiables por sí solos, cualquiera podría inventarlos. Siempre
        se confirma preguntándole directamente a Mercado Pago.
    */
    async consultarOrder(idOrdenMercadoPago: string): Promise<EstadoOrderMercadoPago> {
        let respuesta: Response;
        try {
            respuesta = await fetch(`${URL_API}/v1/orders/${encodeURIComponent(idOrdenMercadoPago)}`, {
                headers: { 'Authorization': `Bearer ${this.token()}` },
                signal: AbortSignal.timeout(15000),
            });
        } catch (error) {
            this.logger.error(`No se pudo consultar la order ${idOrdenMercadoPago}: ${error}`);
            throw new BadGatewayException('No se pudo confirmar el pago. Probá de nuevo en un momento');
        }

        const respuestaJson = await respuesta.json().catch(() => null);

        if (!respuesta.ok || !respuestaJson?.status) {
            this.logger.error(`Mercado Pago no devolvió la order ${idOrdenMercadoPago} (${respuesta.status}): ${JSON.stringify(respuestaJson)}`);
            throw new BadGatewayException('No se pudo confirmar el pago. Probá de nuevo en un momento');
        }

        return {
            status: respuestaJson.status,
            statusDetail: respuestaJson.status_detail ?? '',
            totalAmount: respuestaJson.total_amount ?? '',
        };
    }

    /*
        Comprueba que el aviso lo mandó Mercado Pago. Cada aviso trae una firma
        (header x-signature) calculada con una clave secreta que solo conocemos
        nosotros y Mercado Pago: se recalcula acá y se compara.
        Si no hay clave configurada no se puede comprobar y se deja pasar: no es
        grave, porque el aviso solo dispara una consulta a Mercado Pago, que es
        la que decide (ver consultarOrder).
    */
    validarFirma(xSignature: string | undefined, xRequestId: string | undefined, idDato: string): boolean {
        const secreto = process.env.WEBHOOK_SECRET_MERCADOPAGO;
        if (!secreto) {
            this.logger.warn('WEBHOOK_SECRET_MERCADOPAGO no está configurada: no se valida la firma de los avisos');
            return true;
        }
        if (!xSignature || !xRequestId) return false;

        // x-signature viene así: "ts=1700000000,v1=abc123..."
        const partes = Object.fromEntries(
            xSignature.split(',').map((parte) => {
                const [clave, ...valor] = parte.trim().split('=');
                return [clave, valor.join('=')];
            }),
        );
        if (!partes.ts || !partes.v1) return false;

        const manifiesto = `id:${idDato.toLowerCase()};request-id:${xRequestId};ts:${partes.ts};`;
        const esperada = createHmac('sha256', secreto).update(manifiesto).digest('hex');

        const recibida = Buffer.from(partes.v1);
        const calculada = Buffer.from(esperada);
        // timingSafeEqual exige el mismo largo; compara sin filtrar información por el tiempo que tarda
        return recibida.length === calculada.length && timingSafeEqual(recibida, calculada);
    }
}
