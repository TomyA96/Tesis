import { Test, TestingModule } from '@nestjs/testing';
import { TicketEventoController } from './ticket-evento.controller';

describe('TicketEventoController', () => {
  let controller: TicketEventoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketEventoController],
    }).compile();

    controller = module.get<TicketEventoController>(TicketEventoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
