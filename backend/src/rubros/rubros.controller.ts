import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RubrosService } from './rubros.service';
import { CreateRubroDto } from './dtos/create.rubro.dto';
import { UpdateRubroDto } from './dtos/update.rubro.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('rubros')
export class RubrosController {
    constructor(private rubrosService: RubrosService) {}

    @Permisos('rubros.ver')
    @Get()
    findAll() {
        return this.rubrosService.findAll()
    }

    @Permisos('rubros.ver')
    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.rubrosService.findOne(id)
    }

    @Permisos('rubros.crear')
    @Post()
    create(@Body() data: CreateRubroDto) {
        return this.rubrosService.create(data)
    }

    @Permisos('rubros.editar')
    @Put(':id')
    update(@Param('id', ParseIdPipe) id: number, @Body() data: UpdateRubroDto) {
        return this.rubrosService.update(id, data)
    }

    @Permisos('rubros.eliminar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number) {
        return this.rubrosService.remove(id)
    }
}
