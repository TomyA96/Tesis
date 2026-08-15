import { Body, Controller, Delete, Get, Param, Put, UseGuards} from '@nestjs/common';
import { PermisoPerfilService } from './permiso-perfil.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('permiso-perfil')
export class PermisoPerfilController {
    constructor(private permisoPerfilService: PermisoPerfilService) {}

    @Permisos('perfiles.ver')
    @Get('perfil/:idPerfil')
    findByPerfil(@Param('idPerfil') idPerfil: string) {
        return this.permisoPerfilService.findByPerfil(Number(idPerfil));
    }

}
