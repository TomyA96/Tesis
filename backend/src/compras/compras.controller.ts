import { Body, Controller, Get, Headers, HttpCode, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dtos/create.compra.dto';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';
import { claveDeOrden } from './utils/clave-orden';
import { ParseIdPipe } from '../utils/parse-id.pipe';

// Rutas públicas: las usa el cliente que compra (sin login) y Mercado Pago.
@Controller('compras')
export class ComprasController {
    constructor(
        private comprasService: ComprasService,
        private mercadoPago: MercadoPagoService,
    ) {}

    // Con la clave, una compra gratuita (que se aprueba en el momento) puede mostrar sus entradas enseguida
    @Post()
    async createCompra(@Body() compraData: CreateCompraDto) {
        const orden = await this.comprasService.createCompra(compraData);
        return { ...orden, clave: claveDeOrden(orden.id) };
    }

    // Lo consulta la pantalla a la que el cliente vuelve después de pagar
    @Get(':id/estado')
    estado(@Param('id', ParseIdPipe) id: number) {
        return this.comprasService.estadoDeCompra(id);
    }

    // Las entradas de una compra aprobada, con sus QR. Pide la clave: el número de orden solo no alcanza
    @Get(':id/entradas')
    entradas(@Param('id', ParseIdPipe) id: number, @Query('clave') clave: string | undefined) {
        return this.comprasService.entradasDeCompra(id, clave ?? '');
    }

    /*
        Mercado Pago llama acá cada vez que cambia una de sus orders (por
        ejemplo, cuando se acredita un pago). Siempre hay que contestar 200
        rápido: si no, Mercado Pago reintenta.
        El aviso en sí no se cree: solo dice "mirá esta order", y el backend
        le pregunta a Mercado Pago cómo está.
    */
    @Post('webhook-mercadopago')
    @HttpCode(200)
    async webhookMercadoPago(
        @Body() body: Record<string, any>,
        @Query('data.id') idEnQuery: string | undefined,
        @Headers('x-signature') firma: string | undefined,
        @Headers('x-request-id') idPedido: string | undefined,
    ) {
        const idDato = String(idEnQuery ?? body?.data?.id ?? '');
        if (!idDato) return { recibido: true };

        if (!this.mercadoPago.validarFirma(firma, idPedido, idDato)) {
            throw new UnauthorizedException('Firma inválida');
        }

        await this.comprasService.sincronizarPorIdMercadoPago(idDato);
        return { recibido: true };
    }
}
