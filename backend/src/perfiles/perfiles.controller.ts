import { Controller } from '@nestjs/common';
import { Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';

@Controller('perfiles')
export class PerfilesController {
    constructor(private perfilesService: PerfilesService) {}

    @Get()
    findAll() {
        return this.perfilesService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.perfilesService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: { nombre: string, descripcion?: string }) {
        return this.perfilesService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: { nombre?: string, descripcion?: string }) {
        return this.perfilesService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.perfilesService.remove(Number(id))
    }
}
