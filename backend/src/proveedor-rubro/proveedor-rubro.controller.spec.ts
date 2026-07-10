import { Test, TestingModule } from '@nestjs/testing';
import { ProveedorRubroController } from './proveedor-rubro.controller';

describe('ProveedorRubroController', () => {
  let controller: ProveedorRubroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProveedorRubroController],
    }).compile();

    controller = module.get<ProveedorRubroController>(ProveedorRubroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
