
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { EstadoUsuario } from '@prisma/client';
import { CreateUsuarioDto } from './dtos/create.usuario.dto';
import { UpdateUsuarioDto } from './dtos/update.usuario.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('usuarios')
export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    @Permisos('usuarios.ver') 
    @Get()
    findAll() {
        return this.usuariosService.findAll();
    }


    @Permisos('usuarios.ver') 
    @Get('user/:usuario')
    findByUsername(@Param('usuario') usuario: string){
        return this.usuariosService.findByUser(usuario)
    }

    @Permisos('usuarios.ver') 
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usuariosService.findOne(Number(id));
    }

    @Permisos('usuarios.crear')
    @Post()
    create(@Body() data: CreateUsuarioDto) {
        return this.usuariosService.create(data);
    }

    @Permisos('usuarios.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateUsuarioDto) {
        return this.usuariosService.update(Number(id), data);
    }

    @Permisos('usuarios.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usuariosService.remove(Number(id));
    }
}
