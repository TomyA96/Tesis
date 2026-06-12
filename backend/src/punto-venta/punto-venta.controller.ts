import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PuntoVentaService } from './punto-venta.service';
import { EstadoPuntoVenta } from '@prisma/client';

@Controller('punto-venta')
export class PuntoVentaController {
    constructor(private puntoVentaService: PuntoVentaService) {}

    @Get()
    findAll() {
        return this.puntoVentaService.findAll()
    }

    @Get('estado/:estado')
    findByEstado(@Param('estado') estado: EstadoPuntoVenta) {
        return this.puntoVentaService.findByEstado(estado)
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.puntoVentaService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: { nombre: string, telefono?: string, estado: EstadoPuntoVenta }) {
        return this.puntoVentaService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: { nombre?: string, telefono?: string, estado?: EstadoPuntoVenta }) {
        return this.puntoVentaService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.puntoVentaService.remove(Number(id))
    }
}
