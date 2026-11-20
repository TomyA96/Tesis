import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MovimientoFinancieroService } from './movimiento-financiero.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateIngresoDto } from './dtos/create.ingreso.dto';
import { CreateGastoDto } from './dtos/create.gasto.dto';
import { UpdateIngresoDto } from './dtos/update.ingreso.dto';
import { UpdateGastoDto } from './dtos/update.gasto.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    Los movimientos se consultan siempre de UN evento, con el permiso de su
    tipo (gastos.ver / ingresos.ver). No hay una ruta que liste todos los
    movimientos de todos los eventos: la vista general de las finanzas está en
    los informes, con su propio permiso.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('movimiento-financiero')
export class MovimientoFinancieroController {
    constructor(private movimientoFinancieroService: MovimientoFinancieroService) {}

    @Permisos('gastos.ver')
    @Get('evento/:idEvento/gastos')
    findGastosPorEvento(@Param('idEvento', ParseIdPipe) idEvento: number) {
        return this.movimientoFinancieroService.findGastosPorEvento(idEvento)
    }

    @Permisos('ingresos.ver')
    @Get('evento/:idEvento/ingresos')
    findIngresosPorEvento(@Param('idEvento', ParseIdPipe) idEvento: number) {
        return this.movimientoFinancieroService.findIngresosPorEvento(idEvento)
    }

    // ── INGRESOS ─────────────────────────────────────────────────────────────

    @Permisos('ingresos.crear')
    @Post('ingreso')
    create(@Body() data: CreateIngresoDto) {
        return this.movimientoFinancieroService.createIngreso(data)
    }

    @Permisos('ingresos.editar')
    @Put('ingreso/:id')
    updateIngreso(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateIngresoDto) {
        return this.movimientoFinancieroService.updateIngreso(id, data)
    }

    @Permisos('ingresos.eliminar')
    @Delete('ingreso/:id')
    deleteIngreso(@Param('id', ParseIdPipe) id: number) {
        return this.movimientoFinancieroService.deleteIngreso(id)
    }

    // ── GASTOS ───────────────────────────────────────────────────────────────

    @Permisos('gastos.crear')
    @Post('gasto')
    createGasto(@Body() data: CreateGastoDto) {
        return this.movimientoFinancieroService.createGasto(data)
    }

    @Permisos('gastos.editar')
    @Put('gasto/:id')
    updateGasto(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateGastoDto) {
        return this.movimientoFinancieroService.updateGasto(id, data)
    }

    @Permisos('gastos.eliminar')
    @Delete('gasto/:id')
    deleteGasto(@Param('id', ParseIdPipe) id: number) {
        return this.movimientoFinancieroService.deleteGasto(id)
    }
}
