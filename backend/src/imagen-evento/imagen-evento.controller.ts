import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ImagenEventoService } from './imagen-evento.service';

@Controller('imagen-evento')
export class ImagenEventoController {
    constructor(private imagenEventoService: ImagenEventoService) {}

    @Get()
    findAll() {
        return this.imagenEventoService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.imagenEventoService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: { idEvento: number, url: string }) {
        return this.imagenEventoService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: { idEvento?: number, url?: string }) {
        return this.imagenEventoService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.imagenEventoService.remove(Number(id))
    }
}
