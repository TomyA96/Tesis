import { Test, TestingModule } from '@nestjs/testing';
import { VentaBuffetController } from './venta-buffet.controller';

describe('VentaBuffetController', () => {
  let controller: VentaBuffetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentaBuffetController],
    }).compile();

    controller = module.get<VentaBuffetController>(VentaBuffetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
