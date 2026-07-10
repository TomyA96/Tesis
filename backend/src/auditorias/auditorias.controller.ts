import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TablaSistema } from '@prisma/client';
import { AuditoriasService } from './auditorias.service';

@Controller('auditorias')
export class AuditoriasController {
    constructor(private auditoriasService: AuditoriasService) {}

    @Get()
    findAll() {
        return this.auditoriasService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.auditoriasService.findOne(Number(id))
    }

    @Post()
    create(@Body() data: {
        idUsuario: number,
        codigo: string,
        descripcion?: string,
        fecha?: Date,
        idRegistro: number,
        tabla: TablaSistema,
    }) {
        return this.auditoriasService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        idUsuario?: number,
        codigo?: string,
        descripcion?: string,
        fecha?: Date,
        idRegistro?: number,
        tabla?: TablaSistema,
    }) {
        return this.auditoriasService.update(Number(id), data)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.auditoriasService.remove(Number(id))
    }
}
