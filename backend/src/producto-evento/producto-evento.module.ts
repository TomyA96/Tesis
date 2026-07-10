import { Module } from '@nestjs/common';
import { ProductoEventoController } from './producto-evento.controller';
import { ProductoEventoService } from './producto-evento.service';

@Module({
  controllers: [ProductoEventoController],
  providers: [ProductoEventoService]
})
export class ProductoEventoModule {}
