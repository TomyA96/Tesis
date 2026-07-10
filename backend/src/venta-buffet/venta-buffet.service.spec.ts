import { Test, TestingModule } from '@nestjs/testing';
import { VentaBuffetService } from './venta-buffet.service';

describe('VentaBuffetService', () => {
  let service: VentaBuffetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentaBuffetService],
    }).compile();

    service = module.get<VentaBuffetService>(VentaBuffetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
