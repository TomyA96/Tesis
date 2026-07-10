import { Test, TestingModule } from '@nestjs/testing';
import { PermisoPerfilService } from './permiso-perfil.service';

describe('PermisoPerfilService', () => {
  let service: PermisoPerfilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermisoPerfilService],
    }).compile();

    service = module.get<PermisoPerfilService>(PermisoPerfilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
