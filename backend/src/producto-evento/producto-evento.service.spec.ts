import { Test, TestingModule } from '@nestjs/testing';
import { ProductoEventoService } from './producto-evento.service';

describe('ProductoEventoService', () => {
  let service: ProductoEventoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductoEventoService],
    }).compile();

    service = module.get<ProductoEventoService>(ProductoEventoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
