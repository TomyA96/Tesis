import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccesosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.acceso.findMany();
    }

    findOne(id: number) {
        return this.prisma.acceso.findUnique({ where: { id } });
    }

    create(data: {
        idTicket: number,
        idUsuario: number,
        fechaHora?: Date,
    }) {
        return this.prisma.acceso.create({ data });
    }

    update(id: number, data: {
        idTicket?: number,
        idUsuario?: number,
        fechaHora?: Date,
    }) {
        return this.prisma.acceso.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.acceso.delete({
            where: { id }
        })
    }
}
