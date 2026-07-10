import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TipoRubro } from '@prisma/client';
import { RubrosService } from './rubros.service';

@Controller('rubros')
export class RubrosController {
    constructor(private rubrosService: RubrosService) {}

    @Get()
    findAll() {
        return this.rubrosService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.rubrosService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: { nombre: string, tipo: TipoRubro }) {
        return this.rubrosService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: { nombre?: string, tipo?: TipoRubro }) {
        return this.rubrosService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.rubrosService.remove(Number(id))
    }
}
