import { Body, Controller, Get, Header, Param, ParseIntPipe, Post, Put, Request, StreamableFile, UseGuards } from '@nestjs/common';
import { VentaPuertaService } from './venta-puerta.service';
import { CreateVentaPuertaDto } from './dtos/create.venta-puerta.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

/*
    La boletería de una jornada (venta de entradas en la puerta). Todo pide
    entradas.vender: quien atiende la boletería necesita ver la entrada, la
    capacidad y sus ventas, aunque no administre eventos. El usuario sale
    del token.

    Vender y reemitir devuelven el PDF de los tickets para imprimir en el
    momento. No hay una ruta para volver a bajar el PDF de una venta: eso
    sería reimprimir el mismo QR (ver VentaPuertaService).
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Permisos('entradas.vender')
@Controller('jornadas/:idJornada/boleteria')
export class VentaPuertaController {
    constructor(private ventaPuertaService: VentaPuertaService) {}

    @Get()
    estado(@Param('idJornada', ParseIntPipe) idJornada: number) {
        return this.ventaPuertaService.estado(idJornada);
    }

    @Get('ventas')
    ventas(@Param('idJornada', ParseIntPipe) idJornada: number) {
        return this.ventaPuertaService.ventas(idJornada);
    }

    @Post('ventas')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'inline; filename="tickets-boleteria.pdf"')
    async vender(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Body() data: CreateVentaPuertaDto,
        @Request() request: { user: { sub: number } },
    ) {
        return new StreamableFile(await this.ventaPuertaService.vender(idJornada, data, request.user.sub));
    }

    @Put('ventas/:idVenta/anular')
    anular(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Param('idVenta', ParseIntPipe) idVenta: number,
        @Request() request: { user: { sub: number } },
    ) {
        return this.ventaPuertaService.anular(idJornada, idVenta, request.user.sub);
    }

    @Post('ventas/:idVenta/reemitir')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'inline; filename="tickets-reemitidos.pdf"')
    async reemitir(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Param('idVenta', ParseIntPipe) idVenta: number,
        @Request() request: { user: { sub: number } },
    ) {
        return new StreamableFile(await this.ventaPuertaService.reemitir(idJornada, idVenta, request.user.sub));
    }
}
