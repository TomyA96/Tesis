import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ProductoEventoService } from './producto-evento.service';
import { AsignarProductosDto } from './dtos/asignar.productos.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('producto-evento')
export class ProductoEventoController {
    constructor(private productoEventoService: ProductoEventoService) {}

    @Permisos('productos.ver')
    @Get('evento/:idEvento')
    findByEvento(@Param('idEvento', ParseIdPipe) idEvento: number) {
        return this.productoEventoService.findByEvento(idEvento)
    }

    @Permisos('productos.asignar')
    @Put('evento/:idEvento')
    asignar(@Param('idEvento', ParseIdPipe) idEvento: number, @Body() data: AsignarProductosDto) {
        return this.productoEventoService.asignar(idEvento, data)
    }
}
