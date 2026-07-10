import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
    constructor(private clientesService: ClientesService) {}

    @Get()
    findAll() {
        return this.clientesService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientesService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        nombre: string,
        dni: string,
        email: string,
        telefono?: string,
    }) {
        return this.clientesService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        nombre?: string,
        dni?: string,
        email?: string,
        telefono?: string,
    }) {
        return this.clientesService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientesService.remove(Number(id))
    }
}
