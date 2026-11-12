import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PuntoVentaService } from './punto-venta.service';
import { CreatePuntoVentaDto } from './dtos/create.punto-venta.dto';
import { UpdatePuntoVentaDto } from './dtos/update.punto-venta.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('puntos-venta')
export class PuntoVentaController {
    constructor(private puntoVentaService: PuntoVentaService) {}

    @Permisos('puntosVenta.ver')
    @Get()
    findAll() {
        return this.puntoVentaService.findAll();
    }

    @Permisos('puntosVenta.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.puntoVentaService.findOne(Number(id));
    }

    @Permisos('puntosVenta.crear')
    @Post()
    create(@Body() data: CreatePuntoVentaDto) {
        return this.puntoVentaService.create(data);
    }

    @Permisos('puntosVenta.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdatePuntoVentaDto) {
        return this.puntoVentaService.update(Number(id), data);
    }

    @Permisos('puntosVenta.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.puntoVentaService.remove(Number(id));
    }
}
