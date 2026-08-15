import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dtos/create.producto.dto';
import { UpdateProductoDto } from './dtos/update.producto.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('productos')
export class ProductosController {
    constructor(private productosService: ProductosService) {}

    @Permisos('productos.ver')
    @Get()
    findAll() {
        return this.productosService.findAll()
    }

    @Permisos('productos.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productosService.findOne(Number(id))
    }

    @Permisos('productos.crear')
    @Post()
    create(@Body() data: CreateProductoDto) {
        return this.productosService.create(data)
    }

    @Permisos('productos.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateProductoDto) {
        return this.productosService.update(Number(id), data)
    }

    @Permisos('productos.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productosService.remove(Number(id))
    }
}
