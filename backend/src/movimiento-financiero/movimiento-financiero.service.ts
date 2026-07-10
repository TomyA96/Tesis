import { Injectable } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MovimientoFinancieroService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.movimientoFinanciero.findMany();
    }

    findOne(id: number) {
        return this.prisma.movimientoFinanciero.findUnique({ where: { id } });
    }

    create(data: {
        idEvento: number,
        idRubro: number,
        idProveedor?: number,
        nroFactura?: string,
        tipoMovimiento: TipoMovimiento,
        fechaHora?: Date,
        monto: number,
        descripcion?: string,
    }) {
        return this.prisma.movimientoFinanciero.create({ data });
    }

    update(id: number, data: {
        idEvento?: number,
        idRubro?: number,
        idProveedor?: number,
        nroFactura?: string,
        tipoMovimiento?: TipoMovimiento,
        fechaHora?: Date,
        monto?: number,
        descripcion?: string,
    }) {
        return this.prisma.movimientoFinanciero.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.movimientoFinanciero.delete({
            where: { id }
        })
    }
}
