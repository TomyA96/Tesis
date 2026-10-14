import { Body, Controller, Post } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dtos/create.compra.dto';

@Controller('compras')
export class ComprasController {
    constructor( private  comprasService: ComprasService ) {}

    @Post()
    createCompra(@Body() compraData: CreateCompraDto) {
        return this.comprasService.createCompra(compraData);
    }
}
