import { Module } from '@nestjs/common';
import { DetalleVentaBuffetController } from './detalle-venta-buffet.controller';
import { DetalleVentaBuffetService } from './detalle-venta-buffet.service';

@Module({
  controllers: [DetalleVentaBuffetController],
  providers: [DetalleVentaBuffetService]
})
export class DetalleVentaBuffetModule {}
