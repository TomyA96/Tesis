import { Body, Controller, Get, ParseIntPipe, Put, Query, Request, UseGuards } from '@nestjs/common';
import { TicketEventoService } from './ticket-evento.service';
import { AsignarTicketsDto, IdsTicketsDto } from './dtos/tickets.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

/*
    Los tickets no se crean ni se editan sueltos: nacen al publicar o
    imprimir un lote (EntradasService). Acá solo se consultan y se mueven
    de estado: asignar a un punto de venta, quitar la asignación y anular.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('tickets')
export class TicketEventoController {
    constructor(private ticketEventoService: TicketEventoService) {}

    // GET /tickets?idJornada=5 → todos los tickets de los lotes de esa jornada
    @Permisos('tickets.ver')
    @Get()
    findDeJornada(@Query('idJornada', ParseIntPipe) idJornada: number) {
        return this.ticketEventoService.findDeJornada(idJornada);
    }

    @Permisos('tickets.asignar')
    @Put('asignar')
    asignar(@Request() request: { user: { sub: number } }, @Body() data: AsignarTicketsDto) {
        // Asignar registra una entrega: guarda quién la hizo
        return this.ticketEventoService.asignar(data.idsTickets, data.idPuntoVenta, request.user.sub);
    }

    @Permisos('tickets.asignar')
    @Put('quitar-asignacion')
    quitarAsignacion(@Body() data: IdsTicketsDto) {
        return this.ticketEventoService.quitarAsignacion(data.idsTickets);
    }

    @Permisos('tickets.anular')
    @Put('anular')
    anular(@Body() data: IdsTicketsDto) {
        return this.ticketEventoService.anular(data.idsTickets);
    }
}
