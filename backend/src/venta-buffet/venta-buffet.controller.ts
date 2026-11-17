import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { VentaBuffetService } from './venta-buffet.service';
import { CreateVentaBuffetDto } from './dtos/create.venta-buffet.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

/*
    La caja del buffet de una jornada. Todo pide buffet.vender: quien atiende
    la caja necesita ver el catálogo y las ventas, aunque no tenga permisos
    de administración de productos. El usuario sale del token.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Permisos('buffet.vender')
@Controller('jornadas/:idJornada/buffet')
export class VentaBuffetController {
    constructor(private ventaBuffetService: VentaBuffetService) {}

    @Get('productos')
    productos(@Param('idJornada', ParseIntPipe) idJornada: number) {
        return this.ventaBuffetService.productos(idJornada);
    }

    @Get('ventas')
    ventas(@Param('idJornada', ParseIntPipe) idJornada: number) {
        return this.ventaBuffetService.ventas(idJornada);
    }

    @Post('ventas')
    registrar(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Body() data: CreateVentaBuffetDto,
        @Request() request: any,
    ) {
        return this.ventaBuffetService.registrar(idJornada, data, request.user.sub);
    }

    @Put('ventas/:idVenta/anular')
    anular(
        @Param('idJornada', ParseIntPipe) idJornada: number,
        @Param('idVenta', ParseIntPipe) idVenta: number,
        @Request() request: any,
    ) {
        return this.ventaBuffetService.anular(idJornada, idVenta, request.user.sub);
    }
}
