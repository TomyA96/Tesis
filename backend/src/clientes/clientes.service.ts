import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.cliente.findMany();
    }

    findOne(id: number) {
        return this.prisma.cliente.findUnique({ where: { id } });
    }

    create(data: {
        nombre: string,
        dni: string,
        email: string,
        telefono?: string,
    }) {
        return this.prisma.cliente.create({ data });
    }

    update(id: number, data: {
        nombre?: string,
        dni?: string,
        email?: string,
        telefono?: string,
    }) {
        return this.prisma.cliente.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.cliente.delete({
            where: { id }
        })
    }
}
