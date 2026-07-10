import { Module } from '@nestjs/common';
import { TicketEventoController } from './ticket-evento.controller';
import { TicketEventoService } from './ticket-evento.service';

@Module({
  controllers: [TicketEventoController],
  providers: [TicketEventoService]
})
export class TicketEventoModule {}
