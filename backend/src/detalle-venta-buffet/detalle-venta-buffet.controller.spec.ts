import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaBuffetController } from './detalle-venta-buffet.controller';

describe('DetalleVentaBuffetController', () => {
  let controller: DetalleVentaBuffetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleVentaBuffetController],
    }).compile();

    controller = module.get<DetalleVentaBuffetController>(DetalleVentaBuffetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
