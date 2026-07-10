import { Injectable } from '@nestjs/common';
import { EstadoProducto, TipoProducto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.producto.findMany();
    }

    findOne(id: number) {
        return this.prisma.producto.findUnique({ where: { id } });
    }

    create(data: {
        nombre: string,
        tipo: TipoProducto,
        precio: number,
        estado: EstadoProducto,
    }) {
        return this.prisma.producto.create({ data });
    }

    update(id: number, data: {
        nombre?: string,
        tipo?: TipoProducto,
        precio?: number,
        estado?: EstadoProducto,
    }) {
        return this.prisma.producto.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.producto.delete({
            where: { id }
        })
    }
}
