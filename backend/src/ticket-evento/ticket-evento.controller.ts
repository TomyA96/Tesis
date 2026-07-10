import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EstadoTicket } from '@prisma/client';
import { TicketEventoService } from './ticket-evento.service';

@Controller('ticket-evento')
export class TicketEventoController {
    constructor(private ticketEventoService: TicketEventoService) {}

    @Get()
    findAll() {
        return this.ticketEventoService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketEventoService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idEntrada: number,
        idOrden?: number,
        idPuntoVenta?: number,
        codigoQR: string,
        numero: string,
        precio: number,
        fechaHora?: Date,
        estado: EstadoTicket,
    }) {
        return this.ticketEventoService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idEntrada?: number,
        idOrden?: number,
        idPuntoVenta?: number,
        codigoQR?: string,
        numero?: string,
        precio?: number,
        fechaHora?: Date,
        estado?: EstadoTicket,
    }) {
        return this.ticketEventoService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ticketEventoService.remove(Number(id))
    }
}
