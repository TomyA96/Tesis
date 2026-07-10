import { Test, TestingModule } from '@nestjs/testing';
import { ImagenEventoService } from './imagen-evento.service';

describe('ImagenEventoService', () => {
  let service: ImagenEventoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImagenEventoService],
    }).compile();

    service = module.get<ImagenEventoService>(ImagenEventoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
