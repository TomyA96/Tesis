import { Module } from '@nestjs/common';
import { MovimientoFinancieroController } from './movimiento-financiero.controller';
import { MovimientoFinancieroService } from './movimiento-financiero.service';

@Module({
  controllers: [MovimientoFinancieroController],
  providers: [MovimientoFinancieroService]
})
export class MovimientoFinancieroModule {}
