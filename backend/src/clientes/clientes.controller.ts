import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    Los clientes son los compradores online (nombre, DNI, email): datos
    personales, así que solo los ve quien tiene permiso para ver ventas. Se
    crean al comprar (ComprasService); no se cargan ni se editan a mano.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Permisos('ventas.ver')
@Controller('clientes')
export class ClientesController {
    constructor(private clientesService: ClientesService) {}

    @Get()
    findAll() {
        return this.clientesService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.clientesService.findOne(id)
    }
}
