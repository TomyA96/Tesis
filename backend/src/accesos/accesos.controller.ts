import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AccesosService } from './accesos.service';
import { CreateAccesoDto } from './dtos/create.acceso.dto';
import { CreateAccesoManualDto } from './dtos/create.acceso-manual.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    Los accesos se registran sobre una jornada. No hay forma de editar ni borrar
    un ingreso: es un registro de auditoría. AuthGuard además dice QUIÉN
    registra el ingreso (se toma del token).
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('jornadas/:idJornada/accesos')
export class AccesosController {
    constructor(private accesosService: AccesosService) {}

    @Permisos('accesos.ver')
    @Get()
    findByJornada(@Param('idJornada', ParseIdPipe) idJornada: number) {
        return this.accesosService.findByJornada(idJornada);
    }

    // Cuántos entraron, para el contador de la pantalla de la puerta
    @Permisos('accesos.ver')
    @Get('resumen')
    resumen(@Param('idJornada', ParseIdPipe) idJornada: number) {
        return this.accesosService.resumen(idJornada);
    }

    @Permisos('accesos.registrar')
    @Post()
    registrar(
        @Param('idJornada', ParseIdPipe) idJornada: number,
        @Body() data: CreateAccesoDto,
        @Request() request: any,
    ) {
        // El usuario sale del token, no del cuerpo: nadie puede registrar un ingreso a nombre de otro
        const { sub: idUsuario } = request.user;
        return this.accesosService.registrarAccesoPorQR(idJornada, data, idUsuario);
    }

    // Para supervisores, cuando el QR no se puede leer (ver el TODO del servicio sobre su permiso propio)
    @Permisos('accesos.registrar')
    @Post('manual')
    registrarManual(
        @Param('idJornada', ParseIdPipe) idJornada: number,
        @Body() data: CreateAccesoManualDto,
        @Request() request: any,
    ) {
        const { sub: idUsuario } = request.user;
        return this.accesosService.registrarAccesoManual(idJornada, data, idUsuario);
    }
}
