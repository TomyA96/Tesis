import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';

@Module({
  providers: [MercadoPagoService],
  // Sin exports, otros módulos (como compras) no pueden usar este servicio.
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
