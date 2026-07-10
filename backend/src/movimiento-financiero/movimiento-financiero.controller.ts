import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { MovimientoFinancieroService } from './movimiento-financiero.service';

@Controller('movimiento-financiero')
export class MovimientoFinancieroController {
    constructor(private movimientoFinancieroService: MovimientoFinancieroService) {}

    @Get()
    findAll() {
        return this.movimientoFinancieroService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.movimientoFinancieroService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idEvento: number,
        idRubro: number,
        idProveedor?: number,
        nroFactura?: string,
        tipoMovimiento: TipoMovimiento,
        fechaHora?: Date,
        monto: number,
        descripcion?: string,
    }) {
        return this.movimientoFinancieroService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idEvento?: number,
        idRubro?: number,
        idProveedor?: number,
        nroFactura?: string,
        tipoMovimiento?: TipoMovimiento,
        fechaHora?: Date,
        monto?: number,
        descripcion?: string,
    }) {
        return this.movimientoFinancieroService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.movimientoFinancieroService.remove(Number(id))
    }
}
