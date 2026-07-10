import { Injectable } from '@nestjs/common';
import { TipoRubro } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RubrosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.rubro.findMany();
    }

    findOne(id: number) {
        return this.prisma.rubro.findUnique({ where: { id } });
    }

    create(data: {
        nombre: string,
        tipo: TipoRubro,
    }) {
        return this.prisma.rubro.create({ data });
    }

    update(id: number, data: {
        nombre?: string,
        tipo?: TipoRubro,
    }) {
        return this.prisma.rubro.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.rubro.delete({
            where: { id }
        })
    }
}
