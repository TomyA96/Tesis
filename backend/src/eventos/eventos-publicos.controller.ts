import { Controller, Param, Get } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { ParseIdPipe } from '../utils/parse-id.pipe';

// Sin @UseGuards — a diferencia de EventosController, estas rutas son
// públicas: las consume la home del sitio, sin login ni permisos.
@Controller('eventos-publicos')
export class EventosPublicosController {
    constructor(private eventosService: EventosService) {}

    @Get()
    findAllActivos() {
        return this.eventosService.findAllActivos();
    }

    @Get(':id')
    findOneEventosPublicos(@Param('id', ParseIdPipe) id: number){
        return this.eventosService.findOneEventoPublico(id)
    }
}
