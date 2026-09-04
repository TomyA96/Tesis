import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { EstadoEntrada } from '@prisma/client';
import { EntradasService } from './entradas.service';
import { CreateEntradaDto } from './dtos/create.entrada.dto';
import { UpdateEntradaDto } from './dtos/update.entrada.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('entradas')
export class EntradasController {
    constructor(private entradasService: EntradasService) {}

    @Permisos("entradas.ver")
    @Get()
    findAll(@Query('idEvento') idEvento: string) {
        return this.entradasService.findAll(Number(idEvento))
    }

    @Permisos('entradas.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.entradasService.findOne(Number(id))
    }

    @Permisos('entradas.crear')
    @Post()
    createEntrada(@Body() data: CreateEntradaDto) {
        return this.entradasService.createEntrada(data)
    }

    @Permisos('entradas.editar')
    @Put(':id')
    updateEntrada(@Param('id') id: string, @Body() data: UpdateEntradaDto) {
        return this.entradasService.updateEntrada(Number(id), data)
    }

    @Permisos('entradas.publicar')
    @Put(':id/publicar')
    publicarEntrada(@Param('id') id: string) {
        return this.entradasService.publicarEntrada(Number(id))
    }

    @Permisos('entradas.editar')
    @Put(':id/habilitar')
    habilitarEntrada(@Param('id') id: string) {
        return this.entradasService.habilitarEntrada(Number(id))
    }
    
    @Permisos('entradas.editar')
    @Put(':id/deshabilitar')
    deshabilitarEntrada(@Param('id') id: string) {
        return this.entradasService.deshabilitarEntrada(Number(id))
    }

    @Permisos('entradas.imprimir')
    @Post(':id/imprimir')
    imprimirEntrada(@Param('id') id: string) {
        return this.entradasService.imprimirEntrada(Number(id))
    }

    @Permisos('entradas.eliminar')
    @Delete(':id')
    deleteEntrada(@Param('id') id: string) {
        return this.entradasService.deleteEntrada(Number(id))
    }
  
}
