import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JornadasService } from './jornadas.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { UpdateJornadaDto } from './dtos/update.jornada.dto';
import { ReprogramarJornadaDto } from './dtos/reprogramar.jornada.dto';
import { ParseIdPipe } from '../utils/parse-id.pipe';

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
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.jornadasService.findOne(id);
    }

    @Permisos('eventos.editar')
    @Put(':id')
    update(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateJornadaDto) {
        return this.jornadasService.update(id, data);
    }

    @Permisos('eventos.eliminar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number) {
        return this.jornadasService.remove(id);
    }

    @Permisos('eventos.publicar')
    @Put(':id/publicar')
    publicar(@Param('id', ParseIdPipe) id: number) {
        return this.jornadasService.publicar(id);
    }

    @Permisos('eventos.concluir')
    @Put(':id/cancelar')
    cancelar(@Param('id', ParseIdPipe) id: number) {
        return this.jornadasService.cancelar(id);
    }

    @Permisos('eventos.concluir')
    @Put(':id/suspender')
    suspender(@Param('id', ParseIdPipe) id: number) {
        return this.jornadasService.suspender(id);
    }

    @Permisos('eventos.concluir')
    @Put(':id/finalizar')
    finalizar(@Param('id', ParseIdPipe) id: number) {
        return this.jornadasService.finalizar(id);
    }

    @Permisos('eventos.publicar')
    @Put(':id/reprogramar')
    reprogramar(@Param('id', ParseIdPipe) id: number, @Body() data: ReprogramarJornadaDto) {
        return this.jornadasService.reprogramar(id, data);
    }
}
