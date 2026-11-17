import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { InformesService } from './informes.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('informes')
export class InformesController {
    constructor(private informesService: InformesService) {}

    // GET /informes/anios → los años con eventos publicados, para el selector del resumen anual
    @Permisos('informes.ver')
    @Get('anios')
    anios() {
        return this.informesService.aniosConEventos();
    }

    // GET /informes/resumen-anual?anio=2026 → totales, datos de los gráficos y la tabla de eventos del año
    @Permisos('informes.ver')
    @Get('resumen-anual')
    resumenAnual(@Query('anio', ParseIntPipe) anio: number) {
        return this.informesService.resumenAnual(anio);
    }

    // GET /informes/eventos/5 → informe del evento: entradas y buffet por jornada, finanzas del evento completo
    @Permisos('informes.ver')
    @Get('eventos/:id')
    informeEvento(@Param('id', ParseIntPipe) id: number) {
        return this.informesService.informeEvento(id);
    }
}
