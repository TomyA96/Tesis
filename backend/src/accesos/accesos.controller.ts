import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AccesosService } from './accesos.service';

@Controller('accesos')
export class AccesosController {
    constructor(private accesosService: AccesosService) {}

    @Get()
    findAll() {
        return this.accesosService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.accesosService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idTicket: number,
        idUsuario: number,
        fechaHora?: Date,
    }) {
        return this.accesosService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idTicket?: number,
        idUsuario?: number,
        fechaHora?: Date,
    }) {
        return this.accesosService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.accesosService.remove(Number(id))
    }
}
