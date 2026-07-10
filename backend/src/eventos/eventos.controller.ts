import { Controller, Get, Put, Post, Delete, Param, Body } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EstadoEvento } from '@prisma/client';

@Controller('eventos')
export class EventosController {
    constructor(private eventosService: EventosService) {}

    // Aquí puedes agregar los métodos para manejar las rutas relacionadas con eventos
    @Get()
    findAll() {
        return this.eventosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventosService.findOne(Number(id));
    }

    @Post()
    create(@Body() data: {
        nombre: string,
        fechaHoraInicio: Date,
        fechaHoraFin?: Date,
        ubicacion: string,
        descripcion?: string,
        estado: EstadoEvento,
        direccion?: string,
        capacidad: number
    }) {
        return this.eventosService.create(data);
    }
    
    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        nombre?: string,
        fechaHoraInicio?: Date,
        fechaHoraFin?: Date,
        ubicacion?: string,
        descripcion?: string,
        estado?: EstadoEvento,
        direccion?: string,
        capacidad?: number
    }) {
        return this.eventosService.update(Number(id), data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventosService.remove(Number(id));
    }
}
