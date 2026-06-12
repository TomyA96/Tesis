import { Test, TestingModule } from '@nestjs/testing';
import { PuntoVentaController } from './punto-venta.controller';

describe('PuntoVentaController', () => {
  let controller: PuntoVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuntoVentaController],
    }).compile();

    controller = module.get<PuntoVentaController>(PuntoVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
