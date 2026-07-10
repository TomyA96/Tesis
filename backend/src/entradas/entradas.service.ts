import { Injectable } from '@nestjs/common';
import { EstadoEntrada } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntradasService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.entrada.findMany();
    }

    findOne(id: number) {
        return this.prisma.entrada.findUnique({ where: { id } });
    }

    create(data: {
        idEvento: number,
        descripcion: string,
        precio: number,
        esFisica: boolean,
        estado: EstadoEntrada,
        cantidad: number,
    }) {
        return this.prisma.entrada.create({ data });
    }

    update(id: number, data: {
        idEvento?: number,
        descripcion?: string,
        precio?: number,
        esFisica?: boolean,
        estado?: EstadoEntrada,
        cantidad?: number,
    }) {
        return this.prisma.entrada.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.entrada.delete({
            where: { id }
        })
    }
}
