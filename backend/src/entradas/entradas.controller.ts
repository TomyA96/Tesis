import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EstadoEntrada } from '@prisma/client';
import { EntradasService } from './entradas.service';

@Controller('entradas')
export class EntradasController {
    constructor(private entradasService: EntradasService) {}

    @Get()
    findAll() {
        return this.entradasService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.entradasService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idEvento: number,
        descripcion: string,
        precio: number,
        esFisica: boolean,
        estado: EstadoEntrada,
        cantidad: number,
    }) {
        return this.entradasService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idEvento?: number,
        descripcion?: string,
        precio?: number,
        esFisica?: boolean,
        estado?: EstadoEntrada,
        cantidad?: number,
    }) {
        return this.entradasService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.entradasService.remove(Number(id))
    }
}
