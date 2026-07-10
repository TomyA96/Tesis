import { Injectable } from '@nestjs/common';
import { CanalVenta, EstadoOrden } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdenCompraService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.ordenCompra.findMany();
    }

    findOne(id: number) {
        return this.prisma.ordenCompra.findUnique({ where: { id } });
    }

    create(data: {
        idCliente?: number,
        canal: CanalVenta,
        fechaHora?: Date,
        total: number,
        estado: EstadoOrden,
    }) {
        return this.prisma.ordenCompra.create({ data });
    }

    update(id: number, data: {
        idCliente?: number,
        canal?: CanalVenta,
        fechaHora?: Date,
        total?: number,
        estado?: EstadoOrden,
    }) {
        return this.prisma.ordenCompra.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.ordenCompra.delete({
            where: { id }
        })
    }
}
