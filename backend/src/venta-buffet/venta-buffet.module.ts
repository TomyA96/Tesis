import { Module } from '@nestjs/common';
import { VentaBuffetController } from './venta-buffet.controller';
import { VentaBuffetService } from './venta-buffet.service';

@Module({
  controllers: [VentaBuffetController],
  providers: [VentaBuffetService]
})
export class VentaBuffetModule {}
