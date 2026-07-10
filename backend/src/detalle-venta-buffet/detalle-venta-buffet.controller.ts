import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DetalleVentaBuffetService } from './detalle-venta-buffet.service';

@Controller('detalle-venta-buffet')
export class DetalleVentaBuffetController {
    constructor(private detalleVentaBuffetService: DetalleVentaBuffetService) {}

    @Get('venta-buffet/:idVentaBuffet')
    findByVentaBuffet(@Param('idVentaBuffet') idVentaBuffet: string) {
        return this.detalleVentaBuffetService.findByVentaBuffet(Number(idVentaBuffet))
    }

    @Get('producto/:idProducto')
    findByProducto(@Param('idProducto') idProducto: string) {
        return this.detalleVentaBuffetService.findByProducto(Number(idProducto))
    }

    @Post()
    create(@Body() data: {
        idProducto: number,
        idVentaBuffet: number,
        cantidad: number,
        precioUnitario: number,
        subtotal: number,
    }) {
        return this.detalleVentaBuffetService.create(data)
    }

    @Put(':idProducto/:idVentaBuffet')
    update(
        @Param('idProducto') idProducto: string,
        @Param('idVentaBuffet') idVentaBuffet: string,
        @Body() data: {
            cantidad?: number,
            precioUnitario?: number,
            subtotal?: number,
        }
    ) {
        return this.detalleVentaBuffetService.update(Number(idProducto), Number(idVentaBuffet), data)
    }

    @Delete(':idProducto/:idVentaBuffet')
    remove(@Param('idProducto') idProducto: string, @Param('idVentaBuffet') idVentaBuffet: string) {
        return this.detalleVentaBuffetService.remove(Number(idProducto), Number(idVentaBuffet))
    }
}
