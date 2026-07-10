import { Injectable } from '@nestjs/common';
import { EstadoReembolso } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReembolsosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.reembolso.findMany();
    }

    findOne(id: number) {
        return this.prisma.reembolso.findUnique({ where: { id } });
    }

    create(data: {
        idTicket: number,
        idUsuario: number,
        motivo: string,
        monto: number,
        fechaHora?: Date,
        estado: EstadoReembolso,
    }) {
        return this.prisma.reembolso.create({ data });
    }

    update(id: number, data: {
        idTicket?: number,
        idUsuario?: number,
        motivo?: string,
        monto?: number,
        fechaHora?: Date,
        estado?: EstadoReembolso,
    }) {
        return this.prisma.reembolso.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.reembolso.delete({
            where: { id }
        })
    }
}
