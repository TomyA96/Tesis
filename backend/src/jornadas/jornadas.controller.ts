import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JornadasService } from './jornadas.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { UpdateJornadaDto } from './dtos/update.jornada.dto';
import { ReprogramarJornadaDto } from './dtos/reprogramar.jornada.dto';

/*
    Las rutas para listar y agregar jornadas de un evento viven en
    EventosController (eventos/:id/jornadas). Acá están las que operan
    sobre una jornada puntual.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('jornadas')
export class JornadasController {
    constructor(private jornadasService: JornadasService) {}

    @Permisos('eventos.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jornadasService.findOne(Number(id));
    }

    @Permisos('eventos.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateJornadaDto) {
        return this.jornadasService.update(Number(id), data);
    }

    @Permisos('eventos.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.jornadasService.remove(Number(id));
    }

    @Permisos('eventos.publicar')
    @Put(':id/publicar')
    publicar(@Param('id') id: string) {
        return this.jornadasService.publicar(Number(id));
    }

    @Permisos('eventos.concluir')
    @Put(':id/cancelar')
    cancelar(@Param('id') id: string) {
        return this.jornadasService.cancelar(Number(id));
    }

    @Permisos('eventos.concluir')
    @Put(':id/suspender')
    suspender(@Param('id') id: string) {
        return this.jornadasService.suspender(Number(id));
    }

    @Permisos('eventos.concluir')
    @Put(':id/finalizar')
    finalizar(@Param('id') id: string) {
        return this.jornadasService.finalizar(Number(id));
    }

    @Permisos('eventos.publicar')
    @Put(':id/reprogramar')
    reprogramar(@Param('id') id: string, @Body() data: ReprogramarJornadaDto) {
        return this.jornadasService.reprogramar(Number(id), data);
    }
}
