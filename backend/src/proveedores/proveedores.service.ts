import { Injectable } from '@nestjs/common';
import { EstadoProveedor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProveedoresService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.proveedor.findMany();
    }

    findOne(id: number) {
        return this.prisma.proveedor.findUnique({ where: { id } });
    }

    create(data: {
        nombre: string,
        email?: string,
        telefono?: string,
        estado: EstadoProveedor,
    }) {
        return this.prisma.proveedor.create({ data });
    }

    update(id: number, data: {
        nombre?: string,
        email?: string,
        telefono?: string,
        estado?: EstadoProveedor,
    }) {
        return this.prisma.proveedor.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.proveedor.delete({
            where: { id }
        })
    }
}
