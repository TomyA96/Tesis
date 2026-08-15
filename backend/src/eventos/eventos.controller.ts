import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { UpdateEventoDto } from './dtos/update.evento.dto';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('eventos')
export class EventosController {
    constructor(private eventosService: EventosService) {}

    // Aquí puedes agregar los métodos para manejar las rutas relacionadas con eventos
    @Permisos('eventos.ver')
    @Get()
    findAll() {
        return this.eventosService.findAll();
    }

    @Permisos('eventos.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventosService.findOne(Number(id));
    }

    @Permisos('eventos.crear')
    @Post()
    create(@Body() data: CreateEventoDto) {
        return this.eventosService.create(data);
    }
    
    @Permisos('eventos.editar')
    @Put(':id')
    async updateEvento(@Param('id') id: string, @Body() data: UpdateEventoDto) {
        return this.eventosService.updateEvento(Number(id), data);
    }

    @Permisos('eventos.eliminar')
    @Delete(':id')
    removeEvento(@Param('id') id: string) {
        return this.eventosService.removeEvento(Number(id));
    }
}
