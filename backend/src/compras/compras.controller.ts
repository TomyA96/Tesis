import { Body, Controller, Get, Headers, HttpCode, Param, ParseIntPipe, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dtos/create.compra.dto';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';

// Rutas públicas: las usa el cliente que compra (sin login) y Mercado Pago.
@Controller('compras')
export class ComprasController {
    constructor(
        private comprasService: ComprasService,
        private mercadoPago: MercadoPagoService,
    ) {}

    @Post()
    createCompra(@Body() compraData: CreateCompraDto) {
        return this.comprasService.createCompra(compraData);
    }

    // Lo consulta la pantalla a la que el cliente vuelve después de pagar
    @Get(':id/estado')
    estado(@Param('id', ParseIntPipe) id: number) {
        return this.comprasService.estadoDeCompra(id);
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
