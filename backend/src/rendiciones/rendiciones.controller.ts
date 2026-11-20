import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { RendicionesService } from './rendiciones.service';
import { CreateRendicionDto } from './dtos/create.rendicion.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('rendiciones')
export class RendicionesController {
    constructor(private rendicionesService: RendicionesService) {}

    // GET /rendiciones?idEvento=5 → historial de rendiciones del evento
    @Permisos('rendiciones.ver')
    @Get()
    findDeEvento(@Query('idEvento', ParseIdPipe) idEvento: number) {
        return this.rendicionesService.findDeEvento(idEvento);
    }

    // GET /rendiciones/locales?idEvento=5 → locales con tickets del evento, pendientes y saldo
    @Permisos('rendiciones.ver')
    @Get('locales')
    localesDeEvento(@Query('idEvento', ParseIdPipe) idEvento: number) {
        return this.rendicionesService.localesDeEvento(idEvento);
    }

    // GET /rendiciones/pendiente?idEvento=5&idPuntoVenta=2 → lo que ese local tiene que rendir
    @Permisos('rendiciones.ver')
    @Get('pendiente')
    pendiente(
        @Query('idEvento', ParseIdPipe) idEvento: number,
        @Query('idPuntoVenta', ParseIdPipe) idPuntoVenta: number,
    ) {
        return this.rendicionesService.pendiente(idEvento, idPuntoVenta);
    }

    @Permisos('rendiciones.registrar')
    @Post()
    registrar(@Request() request: { user: { sub: number } }, @Body() data: CreateRendicionDto) {
        // El AuthGuard deja el usuario del token en request.user: la rendición guarda quién la registró
        return this.rendicionesService.registrar(request.user.sub, data);
    }
}
