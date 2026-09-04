import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { UpdateEventoDto } from './dtos/update.evento.dto';
import { ReprogramarEventoDto } from './dtos/reprogramar.evento.dto';

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

    @Permisos('eventos.publicar')
    @Put(':id/publicar')
    publicar(@Param('id') id: string) {
        return this.eventosService.publicarEvento(Number(id));
    }

    @Permisos('eventos.concluir')
    @Put(':id/cancelar')
    cancelar(@Param('id') id: string) {
        return this.eventosService.cancelarEvento(Number(id));
    }

    @Permisos('eventos.concluir')
    @Put(':id/suspender')
    suspender(@Param('id') id: string) {
        return this.eventosService.suspenderEvento(Number(id));
    }

    @Permisos('eventos.concluir')
    @Put(':id/finalizar')
    finalizar(@Param('id') id: string) {
        return this.eventosService.finalizarEvento(Number(id));
    }

    @Permisos('eventos.publicar')
    @Put(':id/reprogramar')
    reprogramar(@Param('id') id: string, @Body() data: ReprogramarEventoDto) {
        return this.eventosService.reprogramarEvento(Number(id), data);
    }

}
