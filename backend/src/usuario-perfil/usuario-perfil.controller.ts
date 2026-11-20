import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UsuarioPerfilService } from './usuario-perfil.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';
import { AsignarPerfilDto } from './dtos/asignar.perfil.dto';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('usuario-perfil')
export class UsuarioPerfilController {
    constructor(private usuarioPerfilService: UsuarioPerfilService) {}

    @Permisos('usuarios.ver')
    @Get('usuario/:idUsuario')
    findByUsuario(@Param('idUsuario', ParseIdPipe) idUsuario: number) {
        return this.usuarioPerfilService.findByUsuario(idUsuario)
    }

    @Permisos('perfiles.ver')
    @Get('perfil/:idPerfil')
    findByPerfil(@Param('idPerfil', ParseIdPipe) idPerfil: number) {
        return this.usuarioPerfilService.findByPerfil(idPerfil)
    }

    @Permisos('usuarios.editar')
    @Post()
    create(@Body() data: AsignarPerfilDto, @Request() request: { user: { sub: number } }) {
        return this.usuarioPerfilService.create(data, request.user.sub)
    }

    @Permisos('usuarios.editar')
    @Delete(':idUsuario/:idPerfil')
    remove(@Param('idUsuario', ParseIdPipe) idUsuario: number, @Param('idPerfil', ParseIdPipe) idPerfil: number, @Request() request: { user: { sub: number } }) {
        return this.usuarioPerfilService.remove(idUsuario, idPerfil, request.user.sub)
    }
}
