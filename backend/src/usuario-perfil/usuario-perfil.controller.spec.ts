import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioPerfilController } from './usuario-perfil.controller';

describe('UsuarioPerfilController', () => {
  let controller: UsuarioPerfilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioPerfilController],
    }).compile();

    controller = module.get<UsuarioPerfilController>(UsuarioPerfilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
