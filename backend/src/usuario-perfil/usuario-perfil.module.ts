import { Module } from '@nestjs/common';
import { UsuarioPerfilController } from './usuario-perfil.controller';
import { UsuarioPerfilService } from './usuario-perfil.service';

@Module({
  controllers: [UsuarioPerfilController],
  providers: [UsuarioPerfilService]
})
export class UsuarioPerfilModule {}
