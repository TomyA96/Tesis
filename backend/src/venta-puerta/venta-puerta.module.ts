import { Module } from '@nestjs/common';
import { VentaPuertaController } from './venta-puerta.controller';
import { VentaPuertaService } from './venta-puerta.service';

@Module({
  controllers: [VentaPuertaController],
  providers: [VentaPuertaService]
})
export class VentaPuertaModule {}
