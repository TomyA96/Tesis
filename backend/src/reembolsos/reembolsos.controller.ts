import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ReembolsosService } from './reembolsos.service';
import { AprobarReembolsosDto, BuscarTicketsDto, RechazarReembolsoDto, RegistrarReembolsoDto } from './dtos/reembolsos.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    Gestión de devoluciones de un evento. Todo pide reembolsos.aprobar: la
    solicitud la hace el comprador (o se genera sola al cancelar); en el
    sistema el encargado la carga cuando la persona se presenta, y la aprueba
    o la rechaza. El usuario sale del token.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Permisos('reembolsos.aprobar')
@Controller('reembolsos')
export class ReembolsosController {
    constructor(private reembolsosService: ReembolsosService) {}

    @Get()
    deEvento(@Query('idEvento', ParseIdPipe) idEvento: number) {
        return this.reembolsosService.deEvento(idEvento);
    }

    // POST porque lleva filtros en el cuerpo (el código QR no conviene en la URL)
    @Post('buscar')
    buscar(@Body() data: BuscarTicketsDto) {
        return this.reembolsosService.buscar(data);
    }

    @Post()
    registrar(@Body() data: RegistrarReembolsoDto, @Request() request: { user: { sub: number } }) {
        return this.reembolsosService.registrar(data, request.user.sub);
    }

    @Put('aprobar')
    aprobar(@Body() data: AprobarReembolsosDto, @Request() request: { user: { sub: number } }) {
        return this.reembolsosService.aprobar(data, request.user.sub);
    }

    @Put(':id/rechazar')
    rechazar(@Param('id', ParseIdPipe) id: number, @Body() data: RechazarReembolsoDto, @Request() request: { user: { sub: number } }) {
        return this.reembolsosService.rechazar(id, data, request.user.sub);
    }
}
