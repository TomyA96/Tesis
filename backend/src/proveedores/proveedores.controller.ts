import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dtos/create.proveedor.dto';
import { UpdateProveedorDto } from './dtos/update.proveedor.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('proveedores')
export class ProveedoresController {
    constructor(private proveedoresService: ProveedoresService) {}

    @Permisos('proveedores.ver')
    @Get()
    findAll() {
        return this.proveedoresService.findAll()
    }

    @Permisos('proveedores.ver')
    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.proveedoresService.findOne(id)
    }

    @Permisos('proveedores.crear')
    @Post()
    create(@Body() data: CreateProveedorDto) {
        return this.proveedoresService.create(data)
    }

    @Permisos('proveedores.editar')
    @Put(':id')
    update(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateProveedorDto) {
        return this.proveedoresService.update(id, data)
    }

    @Permisos('proveedores.eliminar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number) {
        return this.proveedoresService.remove(id)
    }
}
