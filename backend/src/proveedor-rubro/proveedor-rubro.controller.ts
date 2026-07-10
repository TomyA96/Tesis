import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProveedorRubroService } from './proveedor-rubro.service';

@Controller('proveedor-rubro')
export class ProveedorRubroController {
    constructor(private proveedorRubroService: ProveedorRubroService) {}

    @Get('proveedor/:idProveedor')
    findByProveedor(@Param('idProveedor') idProveedor: string) {
        return this.proveedorRubroService.findByProveedor(Number(idProveedor))
    }

    @Get('rubro/:idRubro')
    findByRubro(@Param('idRubro') idRubro: string) {
        return this.proveedorRubroService.findByRubro(Number(idRubro))
    }

    @Post()
    create(@Body() data: { idProveedor: number, idRubro: number }) {
        return this.proveedorRubroService.create(data)
    }

    @Delete(':idProveedor/:idRubro')
    remove(@Param('idProveedor') idProveedor: string, @Param('idRubro') idRubro: string) {
        return this.proveedorRubroService.remove(Number(idProveedor), Number(idRubro))
    }
}
