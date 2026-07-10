import { Module } from '@nestjs/common';
import { PermisoPerfilController } from './permiso-perfil.controller';
import { PermisoPerfilService } from './permiso-perfil.service';

@Module({
  controllers: [PermisoPerfilController],
  providers: [PermisoPerfilService]
})
export class PermisoPerfilModule {}
