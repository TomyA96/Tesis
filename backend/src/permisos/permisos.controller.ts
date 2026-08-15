import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('permisos')
export class PermisosController {
    constructor(private permisosService: PermisosService) {}

    @Permisos('perfiles.ver')
    @Get()
    findAll() {
        return this.permisosService.findAll();
    }
}
