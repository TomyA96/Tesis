import { Module } from '@nestjs/common';
import { ImagenEventoController } from './imagen-evento.controller';
import { ImagenEventoService } from './imagen-evento.service';

@Module({
  controllers: [ImagenEventoController],
  providers: [ImagenEventoService]
})
export class ImagenEventoModule {}
