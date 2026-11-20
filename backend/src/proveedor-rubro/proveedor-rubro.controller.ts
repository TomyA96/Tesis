import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProveedorRubroService } from './proveedor-rubro.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    El alta y la edición de proveedores ya manejan sus rubros solos (dentro de la
    transacción de ProveedoresService), así que estos endpoints quedan como
    consultas puntuales de la relación. Reutilizan los permisos de proveedores en
    vez de crear permisos nuevos para la tabla intermedia.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('proveedor-rubro')
export class ProveedorRubroController {
    constructor(private proveedorRubroService: ProveedorRubroService) {}

    @Permisos('proveedores.ver')
    @Get('proveedor/:idProveedor')
    findByProveedor(@Param('idProveedor', ParseIdPipe) idProveedor: number) {
        return this.proveedorRubroService.findByProveedor(idProveedor)
    }

    @Permisos('proveedores.ver')
    @Get('rubro/:idRubro')
    findByRubro(@Param('idRubro', ParseIdPipe) idRubro: number) {
        return this.proveedorRubroService.findByRubro(idRubro)
    }

    @Permisos('proveedores.editar')
    @Post()
    create(@Body() data: { idProveedor: number, idRubro: number }) {
        return this.proveedorRubroService.create(data)
    }

    @Permisos('proveedores.editar')
    @Delete(':idProveedor/:idRubro')
    remove(@Param('idProveedor', ParseIdPipe) idProveedor: number, @Param('idRubro', ParseIdPipe) idRubro: number) {
        return this.proveedorRubroService.remove(idProveedor, idRubro)
    }
}
