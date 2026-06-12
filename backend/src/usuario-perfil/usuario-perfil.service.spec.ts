import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioPerfilService } from './usuario-perfil.service';

describe('UsuarioPerfilService', () => {
  let service: UsuarioPerfilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuarioPerfilService],
    }).compile();

    service = module.get<UsuarioPerfilService>(UsuarioPerfilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
