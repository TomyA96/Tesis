import { Module } from '@nestjs/common';
import { FuentesIngresoController } from './fuentes-ingreso.controller';
import { FuentesIngresoService } from './fuentes-ingreso.service';

@Module({
  controllers: [FuentesIngresoController],
  providers: [FuentesIngresoService]
})
export class FuentesIngresoModule {}
