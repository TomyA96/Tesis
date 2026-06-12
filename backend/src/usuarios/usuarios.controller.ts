
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { EstadoUsuario } from '@prisma/client';


@Controller('usuarios')
export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    @Get()
    findAll() {
        return this.usuariosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usuariosService.findOne(Number(id));
    }

    @Post()
    create(@Body() data: {usuario: string, nombre: string, password: string, estado?: EstadoUsuario}) {
        return this.usuariosService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {usuario?: string, nombre?: string, password?: string, estado?: EstadoUsuario}) {
        return this.usuariosService.update(Number(id), data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usuariosService.remove(Number(id));
    }
}
