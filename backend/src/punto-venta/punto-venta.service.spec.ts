import { Test, TestingModule } from '@nestjs/testing';
import { PuntoVentaService } from './punto-venta.service';

describe('PuntoVentaService', () => {
  let service: PuntoVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuntoVentaService],
    }).compile();

    service = module.get<PuntoVentaService>(PuntoVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
