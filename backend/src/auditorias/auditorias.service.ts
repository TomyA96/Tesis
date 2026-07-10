import { Injectable } from '@nestjs/common';
import { TablaSistema } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditoriasService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.auditoria.findMany();
    }

    findOne(id: number) {
        return this.prisma.auditoria.findUnique({ where: { id } });
    }

    create(data: {
        idUsuario: number,
        codigo: string,
        descripcion?: string,
        fecha?: Date,
        idRegistro: number,
        tabla: TablaSistema,
    }) {
        return this.prisma.auditoria.create({ data });
    }

    update(id: number, data: {
        idUsuario?: number,
        codigo?: string,
        descripcion?: string,
        fecha?: Date,
        idRegistro?: number,
        tabla?: TablaSistema,
    }) {
        return this.prisma.auditoria.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.auditoria.delete({
            where: { id }
        })
    }
}
