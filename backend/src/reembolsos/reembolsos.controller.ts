import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EstadoReembolso } from '@prisma/client';
import { ReembolsosService } from './reembolsos.service';

@Controller('reembolsos')
export class ReembolsosController {
    constructor(private reembolsosService: ReembolsosService) {}

    @Get()
    findAll() {
        return this.reembolsosService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reembolsosService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idTicket: number,
        idUsuario: number,
        motivo: string,
        monto: number,
        fechaHora?: Date,
        estado: EstadoReembolso,
    }) {
        return this.reembolsosService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idTicket?: number,
        idUsuario?: number,
        motivo?: string,
        monto?: number,
        fechaHora?: Date,
        estado?: EstadoReembolso,
    }) {
        return this.reembolsosService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reembolsosService.remove(Number(id))
    }
}
