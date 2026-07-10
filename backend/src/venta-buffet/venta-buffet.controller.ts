import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { VentaBuffetService } from './venta-buffet.service';

@Controller('venta-buffet')
export class VentaBuffetController {
    constructor(private ventaBuffetService: VentaBuffetService) {}

    @Get()
    findAll() {
        return this.ventaBuffetService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ventaBuffetService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idEvento: number,
        idUsuario: number,
        fechaHora?: Date,
        total: number,
    }) {
        return this.ventaBuffetService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idEvento?: number,
        idUsuario?: number,
        fechaHora?: Date,
        total?: number,
    }) {
        return this.ventaBuffetService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ventaBuffetService.remove(Number(id))
    }
}
