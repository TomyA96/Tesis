import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ProductoEventoService } from './producto-evento.service';
import { AsignarProductosDto } from './dtos/asignar.productos.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('producto-evento')
export class ProductoEventoController {
    constructor(private productoEventoService: ProductoEventoService) {}

    @Permisos('productos.ver')
    @Get('evento/:idEvento')
    findByEvento(@Param('idEvento') idEvento: string) {
        return this.productoEventoService.findByEvento(Number(idEvento))
    }

    @Permisos('productos.asignar')
    @Put('evento/:idEvento')
    asignar(@Param('idEvento') idEvento: string, @Body() data: AsignarProductosDto) {
        return this.productoEventoService.asignar(Number(idEvento), data)
    }
}
