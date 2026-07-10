import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductoEventoService {
    constructor(private prisma: PrismaService) {}

    findByProducto(idProducto: number) {
        return this.prisma.productoEvento.findMany({
            where: { idProducto },
            include: { evento: true }
        })
    }

    findByEvento(idEvento: number) {
        return this.prisma.productoEvento.findMany({
            where: { idEvento },
            include: { producto: true }
        })
    }

    create(data: {
        idProducto: number,
        idEvento: number,
    }) {
        return this.prisma.productoEvento.create({ data });
    }

    remove(idProducto: number, idEvento: number) {
        return this.prisma.productoEvento.delete({
            where: {
                idProducto_idEvento: {
                    idProducto,
                    idEvento
                }
            }
        })
    }
}
