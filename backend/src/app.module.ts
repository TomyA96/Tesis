import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { PuntoVentaModule } from './punto-venta/punto-venta.module'
import { UsuariosModule } from './usuarios/usuarios.module'
import { PerfilesModule } from './perfiles/perfiles.module'
import { UsuarioPerfilModule } from './usuario-perfil/usuario-perfil.module'

@Module({
  imports: [PrismaModule, PuntoVentaModule, UsuariosModule, PerfilesModule, UsuarioPerfilModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
