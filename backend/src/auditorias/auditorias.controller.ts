import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditoriasService } from './auditorias.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

/*
    La auditoría solo se consulta. Los registros los crea el propio backend
    (AuditoriasService) cuando pasa algo que hay que dejar asentado: si se
    pudieran crear, editar o borrar desde afuera, el registro dejaría de
    servir como prueba de lo que pasó. Por eso no hay POST, PUT ni DELETE.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Permisos('auditorias.ver')
@Controller('auditorias')
export class AuditoriasController {
    constructor(private auditoriasService: AuditoriasService) {}

    @Get()
    findAll() {
        return this.auditoriasService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.auditoriasService.findOne(id)
    }
}
