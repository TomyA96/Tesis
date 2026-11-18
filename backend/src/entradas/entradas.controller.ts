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

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('entradas')
export class EntradasController {
    constructor(private entradasService: EntradasService) {}

    @Permisos("entradas.ver")
    @Get()
    findAll(@Query('idJornada') idJornada?: string, @Query('idEvento') idEvento?: string) {
        if (!idJornada && !idEvento) {
            throw new BadRequestException('Indicá idJornada o idEvento para listar las entradas');
        }
        return this.entradasService.findAll({
            idJornada: idJornada ? Number(idJornada) : undefined,
            idEvento: idEvento ? Number(idEvento) : undefined,
        })
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

    // Reemplaza a eliminar para un lote que ya tiene tickets: por eso usa el mismo permiso
    @Permisos('entradas.eliminar')
    @Put(':id/anular')
    anularEntrada(@Param('id') id: string) {
        return this.entradasService.anularEntrada(Number(id))
    }

    @Permisos('entradas.imprimir')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="tickets.pdf"')
    @Post(':id/imprimir')
    async imprimirEntrada(@Param('id') id: string) {
        const bufferPDF = await this.entradasService.imprimirEntrada(Number(id));
        return new StreamableFile(bufferPDF);
    }

    @Permisos('entradas.eliminar')
    @Delete(':id')
    deleteEntrada(@Param('id') id: string) {
        return this.entradasService.deleteEntrada(Number(id))
    }
  
}
