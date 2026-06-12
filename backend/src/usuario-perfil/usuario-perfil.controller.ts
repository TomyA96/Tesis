import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsuarioPerfilService } from './usuario-perfil.service';

@Controller('usuario-perfil')
export class UsuarioPerfilController {
    constructor(private usuarioPerfilService: UsuarioPerfilService) {}

    

    @Get('usuario/:idUsuario')
    findByUsuario(@Param('idUsuario') idUsuario: string) {
        return this.usuarioPerfilService.findByUsuario(Number(idUsuario))
    }

    @Get('perfil/:idPerfil')
    findByPerfil(@Param('idPerfil') idPerfil: string) {
        return this.usuarioPerfilService.findByPerfil(Number(idPerfil))
    }

    @Post()
    create(@Body() data: { idUsuario: number, idPerfil: number }) {
        return this.usuarioPerfilService.create(data)
    }

    @Delete(':idUsuario/:idPerfil')
    remove(@Param('idUsuario') idUsuario: string, @Param('idPerfil') idPerfil: string) {
        return this.usuarioPerfilService.remove(Number(idUsuario), Number(idPerfil))
    }
}
