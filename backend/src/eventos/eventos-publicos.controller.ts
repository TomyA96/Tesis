import { Controller, Param, Get } from '@nestjs/common';
import { EventosService } from './eventos.service';

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
    findOneEventosPublicos(@Param('id') id: string){
        return this.eventosService.findOneEventoPublico(Number(id))
    }
}
