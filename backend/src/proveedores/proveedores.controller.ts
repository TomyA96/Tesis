import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EstadoProveedor } from '@prisma/client';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
export class ProveedoresController {
    constructor(private proveedoresService: ProveedoresService) {}

    @Get()
    findAll() {
        return this.proveedoresService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.proveedoresService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        nombre: string,
        email?: string,
        telefono?: string,
        estado: EstadoProveedor,
    }) {
        return this.proveedoresService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        nombre?: string,
        email?: string,
        telefono?: string,
        estado?: EstadoProveedor,
    }) {
        return this.proveedoresService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.proveedoresService.remove(Number(id))
    }
}
