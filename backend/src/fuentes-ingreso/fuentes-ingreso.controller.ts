import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { FuentesIngresoService } from './fuentes-ingreso.service';
import { CreateFuenteDto } from './dtos/create.fuente.dto';
import { UpdateFuenteDto } from './dtos/update.fuente.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('fuentes-ingreso')
export class FuentesIngresoController {
    constructor(private fuentesIngresoService: FuentesIngresoService) {}

    @Permisos('fuentes.ver')
    @Get()
    findAll() {
        return this.fuentesIngresoService.findAll()
    }

    @Permisos('fuentes.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fuentesIngresoService.findOne(Number(id))
    }

    @Permisos('fuentes.crear')
    @Post()
    create(@Body() data: CreateFuenteDto) {
        return this.fuentesIngresoService.create(data)
    }

    @Permisos('fuentes.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateFuenteDto) {
        return this.fuentesIngresoService.update(Number(id), data)
    }

    @Permisos('fuentes.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fuentesIngresoService.remove(Number(id))
    }
}
