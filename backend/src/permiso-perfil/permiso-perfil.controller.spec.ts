import { Test, TestingModule } from '@nestjs/testing';
import { PermisoPerfilController } from './permiso-perfil.controller';

describe('PermisoPerfilController', () => {
  let controller: PermisoPerfilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermisoPerfilController],
    }).compile();

    controller = module.get<PermisoPerfilController>(PermisoPerfilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
