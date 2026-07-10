import { Test, TestingModule } from '@nestjs/testing';
import { TicketEventoService } from './ticket-evento.service';

describe('TicketEventoService', () => {
  let service: TicketEventoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketEventoService],
    }).compile();

    service = module.get<TicketEventoService>(TicketEventoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
