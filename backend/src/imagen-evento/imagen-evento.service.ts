import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagenEventoService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.imagenEvento.findMany();
    }

    findOne(id: number) {
        return this.prisma.imagenEvento.findUnique({ where: { id } });
    }

    create(data: {
        idEvento: number,
        url: string,
    }) {
        return this.prisma.imagenEvento.create({ data });
    }

    update(id: number, data: {
        idEvento?: number,
        url?: string,
    }) {
        return this.prisma.imagenEvento.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.imagenEvento.delete({
            where: { id }
        })
    }
}
