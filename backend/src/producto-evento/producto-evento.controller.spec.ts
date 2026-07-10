import { Test, TestingModule } from '@nestjs/testing';
import { ProductoEventoController } from './producto-evento.controller';

describe('ProductoEventoController', () => {
  let controller: ProductoEventoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoEventoController],
    }).compile();

    controller = module.get<ProductoEventoController>(ProductoEventoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
