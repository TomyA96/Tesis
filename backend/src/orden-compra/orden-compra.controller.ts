import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CanalVenta, EstadoOrden } from '@prisma/client';
import { OrdenCompraService } from './orden-compra.service';

@Controller('orden-compra')
export class OrdenCompraController {
    constructor(private ordenCompraService: OrdenCompraService) {}

    @Get()
    findAll() {
        return this.ordenCompraService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordenCompraService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idCliente?: number,
        canal: CanalVenta,
        fechaHora?: Date,
        total: number,
        estado: EstadoOrden,
    }) {
        return this.ordenCompraService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idCliente?: number,
        canal?: CanalVenta,
        fechaHora?: Date,
        total?: number,
        estado?: EstadoOrden,
    }) {
        return this.ordenCompraService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordenCompraService.remove(Number(id))
    }
}
