import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EstadoProducto, TipoProducto } from '@prisma/client';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
    constructor(private productosService: ProductosService) {}

    @Get()
    findAll() {
        return this.productosService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productosService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        nombre: string,
        tipo: TipoProducto,
        precio: number,
        estado: EstadoProducto,
    }) {
        return this.productosService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        nombre?: string,
        tipo?: TipoProducto,
        precio?: number,
        estado?: EstadoProducto,
    }) {
        return this.productosService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productosService.remove(Number(id))
    }
}
