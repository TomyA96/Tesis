import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DetalleVentaBuffetService {
    constructor(private prisma: PrismaService) {}

    findByVentaBuffet(idVentaBuffet: number) {
        return this.prisma.detalleVentaBuffet.findMany({
            where: { idVentaBuffet },
            include: { producto: true }
        })
    }

    findByProducto(idProducto: number) {
        return this.prisma.detalleVentaBuffet.findMany({
            where: { idProducto },
            include: { ventaBuffet: true }
        })
    }

    create(data: {
        idProducto: number,
        idVentaBuffet: number,
        cantidad: number,
        precioUnitario: number,
        subtotal: number,
    }) {
        return this.prisma.detalleVentaBuffet.create({ data });
    }

    update(idProducto: number, idVentaBuffet: number, data: {
        cantidad?: number,
        precioUnitario?: number,
        subtotal?: number,
    }) {
        return this.prisma.detalleVentaBuffet.update({
            where: {
                idProducto_idVentaBuffet: {
                    idProducto,
                    idVentaBuffet
                }
            },
            data
        })
    }

    remove(idProducto: number, idVentaBuffet: number) {
        return this.prisma.detalleVentaBuffet.delete({
            where: {
                idProducto_idVentaBuffet: {
                    idProducto,
                    idVentaBuffet
                }
            }
        })
    }
}
