import { Test, TestingModule } from '@nestjs/testing';
import { AccesosController } from './accesos.controller';

describe('AccesosController', () => {
  let controller: AccesosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccesosController],
    }).compile();

    controller = module.get<AccesosController>(AccesosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
