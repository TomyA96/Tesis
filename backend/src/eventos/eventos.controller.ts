import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { JornadasService } from '../jornadas/jornadas.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { UpdateEventoDto } from './dtos/update.evento.dto';
import { CreateJornadaDto } from '../jornadas/dtos/create.jornada.dto';
import { CreateJornadasLoteDto } from '../jornadas/dtos/create.jornadas-lote.dto';
import { ConcluirEventoDto } from './dtos/concluir.evento.dto';
import { PublicarEventoDto } from './dtos/publicar.evento.dto';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('eventos')
export class EventosController {
    constructor(private eventosService: EventosService, private jornadasService: JornadasService) {}

    @Permisos('eventos.ver')
    @Get()
    findAll() {
        return this.eventosService.findAll();
    }

    @Permisos('eventos.ver')
    @Get('publicados')
    findAllPublicados() {
        return this.eventosService.findAllPublicados();
    }

    // Va antes de ':id' para que "pendientes-de-cierre" no se tome como un id
    @Permisos('eventos.ver')
    @Get('pendientes-de-cierre')
    pendientesDeCierre() {
        return this.eventosService.pendientesDeCierre();
    }

    @Permisos('eventos.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventosService.findOne(Number(id));
    }

    // El estado de cada jornada (publicar, cancelar, etc.) se maneja en JornadasController
    @Permisos('eventos.ver')
    @Get(':id/jornadas')
    findJornadas(@Param('id') id: string) {
        return this.jornadasService.findAllByEvento(Number(id));
    }

    @Permisos('eventos.crear')
    @Post()
    create(@Body() data: CreateEventoDto) {
        return this.eventosService.createEvento(data);
    }

    @Permisos('eventos.editar')
    @Post(':id/jornadas')
    addJornada(@Param('id') id: string, @Body() data: CreateJornadaDto) {
        return this.jornadasService.create(Number(id), data);
    }

    // Varias jornadas de una vez (todas o ninguna)
    @Permisos('eventos.editar')
    @Post(':id/jornadas/lote')
    addJornadas(@Param('id') id: string, @Body() data: CreateJornadasLoteDto) {
        return this.jornadasService.createVarias(Number(id), data.jornadas);
    }

    @Permisos('eventos.editar')
    @Put(':id')
    async updateEvento(@Param('id') id: string, @Body() data: UpdateEventoDto) {
        return this.eventosService.updateEvento(Number(id), data);
    }

    // Qué le falta a cada jornada en Borrador para poder publicarse
    @Permisos('eventos.ver')
    @Get(':id/publicacion')
    revisarPublicacion(@Param('id') id: string) {
        return this.eventosService.revisarPublicacion(Number(id));
    }

    // Activa el evento (si está en Borrador) y publica sus jornadas completas
    @Permisos('eventos.publicar')
    @Put(':id/publicar')
    publicar(@Param('id') id: string, @Body() data?: PublicarEventoDto) {
        return this.eventosService.publicar(Number(id), data?.confirmarIncompletas);
    }

    // Suspende todas las jornadas activas del evento; el evento sigue Activo
    @Permisos('eventos.concluir')
    @Put(':id/suspender')
    suspender(@Param('id') id: string) {
        return this.eventosService.suspender(Number(id));
    }

    // Cierre manual del evento: ninguna jornada puede quedar activa o suspendida
    @Permisos('eventos.concluir')
    @Put(':id/finalizar')
    finalizar(@Param('id') id: string, @Body() data?: ConcluirEventoDto) {
        return this.eventosService.finalizar(Number(id), data?.descartarBorradores);
    }

    // Cancela todas las jornadas activas o suspendidas; el evento sigue Activo hasta que se finalice
    @Permisos('eventos.concluir')
    @Put(':id/cancelar')
    cancelar(@Param('id') id: string) {
        return this.eventosService.cancelar(Number(id));
    }

    @Permisos('eventos.eliminar')
    @Delete(':id')
    removeEvento(@Param('id') id: string) {
        return this.eventosService.removeEvento(Number(id));
    }
}
