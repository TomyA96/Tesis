import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsuarioPerfilService } from './usuario-perfil.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('usuario-perfil')
export class UsuarioPerfilController {
    constructor(private usuarioPerfilService: UsuarioPerfilService) {}

    @Permisos('usuarios.ver')
    @Get('usuario/:idUsuario')
    findByUsuario(@Param('idUsuario') idUsuario: string) {
        return this.usuarioPerfilService.findByUsuario(Number(idUsuario))
    }

    @Permisos('perfiles.ver')
    @Get('perfil/:idPerfil')
    findByPerfil(@Param('idPerfil') idPerfil: string) {
        return this.usuarioPerfilService.findByPerfil(Number(idPerfil))
    }

    @Permisos('usuarios.editar')
    @Post()
    create(@Body() data: { idUsuario: number, idPerfil: number }) {
        return this.usuarioPerfilService.create(data)
    }

    @Permisos('usuarios.editar')
    @Delete(':idUsuario/:idPerfil')
    remove(@Param('idUsuario') idUsuario: string, @Param('idPerfil') idPerfil: string) {
        return this.usuarioPerfilService.remove(Number(idUsuario), Number(idPerfil))
    }
}
