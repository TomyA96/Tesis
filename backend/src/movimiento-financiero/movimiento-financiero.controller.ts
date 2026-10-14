import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MovimientoFinancieroService } from './movimiento-financiero.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateIngresoDto } from './dtos/create.ingreso.dto';
import { CreateGastoDto } from './dtos/create.gasto.dto';
import { UpdateIngresoDto } from './dtos/update.ingreso.dto';
import { UpdateGastoDto } from './dtos/update.gasto.dto';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('movimiento-financiero')
export class MovimientoFinancieroController {
    constructor(private movimientoFinancieroService: MovimientoFinancieroService) {}

    @Get()
    findAll() {
        return this.movimientoFinancieroService.findAll()
    }

    @Permisos('gastos.ver')
    @Get('evento/:idEvento/gastos')
    findGastosPorEvento(@Param('idEvento') idEvento: string) {
        return this.movimientoFinancieroService.findGastosPorEvento(Number(idEvento))
    }

    @Permisos('ingresos.ver')
    @Get('evento/:idEvento/ingresos')
    findIngresosPorEvento(@Param('idEvento') idEvento: string) {
        return this.movimientoFinancieroService.findIngresosPorEvento(Number(idEvento))
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.movimientoFinancieroService.findOne(Number(id))
    }

    // ── INGRESOS ─────────────────────────────────────────────────────────────

    @Permisos('ingresos.crear')
    @Post('ingreso')
    create(@Body() data: CreateIngresoDto) {
        return this.movimientoFinancieroService.createIngreso(data)
    }

    @Permisos('ingresos.editar')
    @Put('ingreso/:id')
    updateIngreso(@Param('id') id: string, @Body() data: UpdateIngresoDto) {
        return this.movimientoFinancieroService.updateIngreso(Number(id), data)
    }

    @Permisos('ingresos.eliminar')
    @Delete('ingreso/:id')
    deleteIngreso(@Param('id') id: string) {
        return this.movimientoFinancieroService.deleteIngreso(Number(id))
    }

    // ── GASTOS ───────────────────────────────────────────────────────────────

    @Permisos('gastos.crear')
    @Post('gasto')
    createGasto(@Body() data: CreateGastoDto) {
        return this.movimientoFinancieroService.createGasto(data)
    }

    @Permisos('gastos.editar')
    @Put('gasto/:id')
    updateGasto(@Param('id') id: string, @Body() data: UpdateGastoDto) {
        return this.movimientoFinancieroService.updateGasto(Number(id), data)
    }

    @Permisos('gastos.eliminar')
    @Delete('gasto/:id')
    deleteGasto(@Param('id') id: string) {
        return this.movimientoFinancieroService.deleteGasto(Number(id))
    }
}
