import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PuntoVentaService } from './punto-venta.service';
import { CreatePuntoVentaDto } from './dtos/create.punto-venta.dto';
import { UpdatePuntoVentaDto } from './dtos/update.punto-venta.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

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
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.puntoVentaService.findOne(id);
    }

    @Permisos('puntosVenta.crear')
    @Post()
    create(@Body() data: CreatePuntoVentaDto) {
        return this.puntoVentaService.create(data);
    }

    @Permisos('puntosVenta.editar')
    @Put(':id')
    update(@Param('id', ParseIdPipe) id: number, @Body() data: UpdatePuntoVentaDto) {
        return this.puntoVentaService.update(id, data);
    }

    @Permisos('puntosVenta.eliminar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number) {
        return this.puntoVentaService.remove(id);
    }
}
