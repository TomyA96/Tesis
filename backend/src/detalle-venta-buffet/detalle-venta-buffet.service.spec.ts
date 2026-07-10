import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaBuffetService } from './detalle-venta-buffet.service';

describe('DetalleVentaBuffetService', () => {
  let service: DetalleVentaBuffetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleVentaBuffetService],
    }).compile();

    service = module.get<DetalleVentaBuffetService>(DetalleVentaBuffetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
