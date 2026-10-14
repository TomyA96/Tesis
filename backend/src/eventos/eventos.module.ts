import { Module } from '@nestjs/common';
import { EventosController } from './eventos.controller';
import { EventosPublicosController } from './eventos-publicos.controller';
import { EventosService } from './eventos.service';
import { ImagenEventoModule } from '../imagen-evento/imagen-evento.module';

@Module({
  imports: [ImagenEventoModule],
  controllers: [EventosController, EventosPublicosController],
  providers: [EventosService]
})
export class EventosModule {}
