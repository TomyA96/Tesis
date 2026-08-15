import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dtos/create.proveedor.dto';
import { UpdateProveedorDto } from './dtos/update.proveedor.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

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
    findOne(@Param('id') id: string) {
        return this.proveedoresService.findOne(Number(id))
    }

    @Permisos('proveedores.crear')
    @Post()
    create(@Body() data: CreateProveedorDto) {
        return this.proveedoresService.create(data)
    }

    @Permisos('proveedores.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateProveedorDto) {
        return this.proveedoresService.update(Number(id), data)
    }

    @Permisos('proveedores.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.proveedoresService.remove(Number(id))
    }
}
