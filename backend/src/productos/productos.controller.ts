import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dtos/create.producto.dto';
import { UpdateProductoDto } from './dtos/update.producto.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

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
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.productosService.findOne(id)
    }

    @Permisos('productos.crear')
    @Post()
    create(@Body() data: CreateProductoDto) {
        return this.productosService.create(data)
    }

    @Permisos('productos.editar')
    @Put(':id')
    update(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateProductoDto) {
        return this.productosService.update(id, data)
    }

    @Permisos('productos.eliminar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number) {
        return this.productosService.remove(id)
    }
}
