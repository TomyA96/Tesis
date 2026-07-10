import { Test, TestingModule } from '@nestjs/testing';
import { OrdenCompraController } from './orden-compra.controller';

describe('OrdenCompraController', () => {
  let controller: OrdenCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenCompraController],
    }).compile();

    controller = module.get<OrdenCompraController>(OrdenCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
