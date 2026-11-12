import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AccesosService } from './accesos.service';
import { CreateAccesoDto } from './dtos/create.acceso.dto';
import { CreateAccesoManualDto } from './dtos/create.acceso-manual.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

/*
    Los accesos se registran sobre una jornada. No hay forma de editar ni borrar
    un ingreso: es un registro de auditoría.

    TODO: PermissionsGuard con @Permisos('accesos.registrar') en el POST y
    @Permisos('accesos.ver') en el GET. Por ahora solo está AuthGuard, que es lo
    que permite saber QUIÉN registra el ingreso (se toma del token).
*/
@UseGuards(AuthGuard)
@Controller('jornadas/:idJornada/accesos')
export class AccesosController {
    constructor(private accesosService: AccesosService) {}

    @Get()
    findByJornada(@Param('idJornada', ParseIntPipe) idJornada: number) {
        return this.accesosService.findByJornada(idJornada);
    }

    @Post()
    registrar(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Body() data: CreateAccesoDto,
        @Request() request: any,
    ) {
        // El usuario sale del token, no del cuerpo: nadie puede registrar un ingreso a nombre de otro
        const { sub: idUsuario } = request.user;
        return this.accesosService.registrarAccesoPorQR(idJornada, data, idUsuario);
    }

    // Para supervisores, cuando el QR no se puede leer (ver el TODO del servicio sobre su permiso propio)
    @Post('manual')
    registrarManual(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Body() data: CreateAccesoManualDto,
        @Request() request: any,
    ) {
        const { sub: idUsuario } = request.user;
        return this.accesosService.registrarAccesoManual(idJornada, data, idUsuario);
    }
}
