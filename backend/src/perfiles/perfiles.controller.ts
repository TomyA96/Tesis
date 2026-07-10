import { Controller, UseGuards } from '@nestjs/common';
import { Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { CreatePerfilDto } from './dtos/create.perfil.dto';
import { UpdatePerfilDto } from './dtos/update.perfil.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('perfiles')
export class PerfilesController {
    constructor(private perfilesService: PerfilesService) {}

    @Permisos('perfiles.ver')
    @Get()
    findAll() {
        return this.perfilesService.findAll()
    }

    @Permisos('perfiles.ver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.perfilesService.findOne(Number(id))
    }

    @Permisos('perfiles.crear')
    @Post()
    create(@Body() data: CreatePerfilDto) {
        return this.perfilesService.create(data)
    }

    @Permisos('perfiles.editar')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdatePerfilDto) {
        return this.perfilesService.update(Number(id), data)
    }

    @Permisos('perfiles.eliminar')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.perfilesService.remove(Number(id))
    }
}
