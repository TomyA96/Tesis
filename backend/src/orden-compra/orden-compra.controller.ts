import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrdenCompraService } from './orden-compra.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    Las órdenes de compra solo se consultan desde el panel (tienen datos de
    los compradores: hace falta permiso para ver ventas). Se crean y cambian
    de estado únicamente por el flujo de compra (ComprasService y el aviso de
    Mercado Pago), que controla stock, reservas y pagos: un PUT suelto
    podría, por ejemplo, aprobar una orden que nunca se pagó.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Permisos('ventas.ver')
@Controller('orden-compra')
export class OrdenCompraController {
    constructor(private ordenCompraService: OrdenCompraService) {}

    @Get()
    findAll() {
        return this.ordenCompraService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.ordenCompraService.findOne(id)
    }
}
