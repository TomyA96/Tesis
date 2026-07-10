import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductoEventoService } from './producto-evento.service';

@Controller('producto-evento')
export class ProductoEventoController {
    constructor(private productoEventoService: ProductoEventoService) {}

    @Get('producto/:idProducto')
    findByProducto(@Param('idProducto') idProducto: string) {
        return this.productoEventoService.findByProducto(Number(idProducto))
    }

    @Get('evento/:idEvento')
    findByEvento(@Param('idEvento') idEvento: string) {
        return this.productoEventoService.findByEvento(Number(idEvento))
    }

    @Post()
    create(@Body() data: { idProducto: number, idEvento: number }) {
        return this.productoEventoService.create(data)
    }

    @Delete(':idProducto/:idEvento')
    remove(@Param('idProducto') idProducto: string, @Param('idEvento') idEvento: string) {
        return this.productoEventoService.remove(Number(idProducto), Number(idEvento))
    }
}
