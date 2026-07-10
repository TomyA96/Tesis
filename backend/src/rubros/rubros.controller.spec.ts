import { Test, TestingModule } from '@nestjs/testing';
import { RubrosController } from './rubros.controller';

describe('RubrosController', () => {
  let controller: RubrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RubrosController],
    }).compile();

    controller = module.get<RubrosController>(RubrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
