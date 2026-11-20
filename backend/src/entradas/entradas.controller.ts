import { BadRequestException, Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Header, StreamableFile } from '@nestjs/common';
import { EstadoEntrada } from '@prisma/client';
import { EntradasService } from './entradas.service';
import { CreateEntradaDto } from './dtos/create.entrada.dto';
import { CreateEntradasLoteDto } from './dtos/create.entradas-lote.dto';
import { ConfigurarBoleteriaDto } from './dtos/configurar-boleteria.dto';
import { UpdateEntradaDto } from './dtos/update.entrada.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { ParseIdOpcionalPipe, ParseIdPipe } from '../utils/parse-id.pipe';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('entradas')
export class EntradasController {
    constructor(private entradasService: EntradasService) {}

    @Permisos("entradas.ver")
    @Get()
    findAll(
        @Query('idJornada', ParseIdOpcionalPipe) idJornada?: number,
        @Query('idEvento', ParseIdOpcionalPipe) idEvento?: number,
    ) {
        // Antes un filtro inválido ("abc") se ignoraba y devolvía los lotes de TODOS los eventos
        if (idJornada === undefined && idEvento === undefined) {
            throw new BadRequestException('Indicá idJornada o idEvento para listar las entradas');
        }
        return this.entradasService.findAll({ idJornada, idEvento })
    }

    @Permisos('entradas.ver')
    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.entradasService.findOne(id)
    }

    @Permisos('entradas.crear')
    @Post()
    createEntrada(@Body() data: CreateEntradaDto) {
        return this.entradasService.createEntrada(data)
    }

    // El mismo lote en varias jornadas (uno en cada una), todo o nada
    @Permisos('entradas.crear')
    @Post('lote')
    createLote(@Body() data: CreateEntradasLoteDto) {
        return this.entradasService.createLote(data)
    }

    // Crea la boletería en las jornadas que no la tienen y le cambia el precio a las que sí
    @Permisos('entradas.crear')
    @Post('boleteria')
    configurarBoleteria(@Body() data: ConfigurarBoleteriaDto) {
        return this.entradasService.configurarBoleteria(data)
    }

    @Permisos('entradas.editar')
    @Put(':id')
    updateEntrada(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateEntradaDto) {
        return this.entradasService.updateEntrada(id, data)
    }

    @Permisos('entradas.publicar')
    @Put(':id/publicar')
    publicarEntrada(@Param('id', ParseIdPipe) id: number) {
        return this.entradasService.publicarEntrada(id)
    }

    @Permisos('entradas.editar')
    @Put(':id/habilitar')
    habilitarEntrada(@Param('id', ParseIdPipe) id: number) {
        return this.entradasService.habilitarEntrada(id)
    }
    
    @Permisos('entradas.editar')
    @Put(':id/deshabilitar')
    deshabilitarEntrada(@Param('id', ParseIdPipe) id: number) {
        return this.entradasService.deshabilitarEntrada(id)
    }

    // Reemplaza a eliminar para un lote que ya tiene tickets: por eso usa el mismo permiso
    @Permisos('entradas.eliminar')
    @Put(':id/anular')
    anularEntrada(@Param('id', ParseIdPipe) id: number) {
        return this.entradasService.anularEntrada(id)
    }

    @Permisos('entradas.imprimir')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="tickets.pdf"')
    @Post(':id/imprimir')
    async imprimirEntrada(@Param('id', ParseIdPipe) id: number) {
        const bufferPDF = await this.entradasService.imprimirEntrada(id);
        return new StreamableFile(bufferPDF);
    }

    @Permisos('entradas.eliminar')
    @Delete(':id')
    deleteEntrada(@Param('id', ParseIdPipe) id: number) {
        return this.entradasService.deleteEntrada(id)
    }
  
}
