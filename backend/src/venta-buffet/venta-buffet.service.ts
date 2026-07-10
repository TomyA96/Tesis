import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VentaBuffetService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.ventaBuffet.findMany();
    }

    findOne(id: number) {
        return this.prisma.ventaBuffet.findUnique({ where: { id } });
    }

    create(data: {
        idEvento: number,
        idUsuario: number,
        fechaHora?: Date,
        total: number,
    }) {
        return this.prisma.ventaBuffet.create({ data });
    }

    update(id: number, data: {
        idEvento?: number,
        idUsuario?: number,
        fechaHora?: Date,
        total?: number,
    }) {
        return this.prisma.ventaBuffet.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.ventaBuffet.delete({
            where: { id }
        })
    }
}
