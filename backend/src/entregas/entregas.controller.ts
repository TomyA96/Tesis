import { Body, Controller, Get, Header, Param, Post, Query, Request, StreamableFile, UseGuards } from '@nestjs/common';
import { EntregasService } from './entregas.service';
import { CreateEntregaDto } from './dtos/create.entrega.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

// Usa los mismos permisos que mover tickets sueltos: entregar es asignar, pero por cantidad
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('entregas')
export class EntregasController {
    constructor(private entregasService: EntregasService) {}

    // GET /entregas?idEvento=5 → historial de entregas del evento
    @Permisos('tickets.ver')
    @Get()
    findDeEvento(@Query('idEvento', ParseIdPipe) idEvento: number) {
        return this.entregasService.findDeEvento(idEvento);
    }

    @Permisos('tickets.ver')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="comprobante-entrega.pdf"')
    @Get(':id/comprobante')
    async comprobante(@Param('id', ParseIdPipe) id: number) {
        return new StreamableFile(await this.entregasService.comprobante(id));
    }

    // Qué números saldrían: para mostrarlo antes de confirmar. No guarda nada.
    @Permisos('tickets.asignar')
    @Post('previa')
    previa(@Body() data: CreateEntregaDto) {
        return this.entregasService.previa(data);
    }

    @Permisos('tickets.asignar')
    @Post()
    registrar(@Request() request: { user: { sub: number } }, @Body() data: CreateEntregaDto) {
        return this.entregasService.registrar(request.user.sub, data);
    }
}
