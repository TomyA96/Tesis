import { Test, TestingModule } from '@nestjs/testing';
import { ImagenEventoController } from './imagen-evento.controller';

describe('ImagenEventoController', () => {
  let controller: ImagenEventoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagenEventoController],
    }).compile();

    controller = module.get<ImagenEventoController>(ImagenEventoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
