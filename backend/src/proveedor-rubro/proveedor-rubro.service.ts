import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProveedorRubroService {
    constructor(private prisma: PrismaService) {}

    findByProveedor(idProveedor: number) {
        return this.prisma.proveedorRubro.findMany({
            where: { idProveedor },
            include: { rubro: true }
        })
    }

    findByRubro(idRubro: number) {
        return this.prisma.proveedorRubro.findMany({
            where: { idRubro },
            include: { proveedor: true }
        })
    }

    create(data: {
        idProveedor: number,
        idRubro: number,
    }) {
        return this.prisma.proveedorRubro.create({ data });
    }

    remove(idProveedor: number, idRubro: number) {
        return this.prisma.proveedorRubro.delete({
            where: {
                idProveedor_idRubro: {
                    idProveedor,
                    idRubro
                }
            }
        })
    }
}
