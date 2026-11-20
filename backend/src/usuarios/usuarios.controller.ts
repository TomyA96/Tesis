
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { EstadoUsuario } from '@prisma/client';
import { CreateUsuarioDto } from './dtos/create.usuario.dto';
import { UpdateUsuarioDto } from './dtos/update.usuario.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

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
    async findByUsername(@Param('usuario') usuario: string){
        const encontrado = await this.usuariosService.findByUser(usuario)
        // Inexistente o eliminado: antes respondía 200 vacío
        if (!encontrado) throw new NotFoundException('Usuario no encontrado')
        return encontrado
    }

    @Permisos('usuarios.ver') 
    @Get(':id')
    async findOne(@Param('id', ParseIdPipe) id: number) {
        const usuario = await this.usuariosService.findOne(id);
        // Inexistente o eliminado: antes respondía 200 vacío
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    @Permisos('usuarios.crear')
    @Post()
    create(@Body() data: CreateUsuarioDto, @Request() request: { user: { sub: number } }) {
        return this.usuariosService.createUser(data, request.user.sub);
    }

    @Permisos('usuarios.editar')
    @Put(':id')
    update(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateUsuarioDto, @Request() request: { user: { sub: number } }) {
        return this.usuariosService.updateUser(id, data, request.user.sub);
    }

    @Permisos('usuarios.eliminar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number, @Request() request: { user: { sub: number } }) {
        return this.usuariosService.remove(id, request.user.sub);
    }
}
