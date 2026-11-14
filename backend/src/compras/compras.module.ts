import { Module } from '@nestjs/common';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';

@Module({
  imports: [MercadoPagoModule],
  controllers: [ComprasController],
  providers: [ComprasService]
})
export class ComprasModule {}
