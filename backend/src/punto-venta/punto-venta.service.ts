import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoPuntoVenta } from '@prisma/client';

@Injectable()
export class PuntoVentaService {
    constructor(private prisma: PrismaService) {}

    //Consultas
    findAll() {
        return this.prisma.puntoVenta.findMany();
    }

    findOne(id: number) {
        return this.prisma.puntoVenta.findUnique({ where: { id } });
    }

    findByEstado(estado: EstadoPuntoVenta) {
        return this.prisma.puntoVenta.findMany({
            where: { 
                estado: estado
            }
        });
    }

    create(data: {
        nombre: string,
        telefono?: string,
        estado: EstadoPuntoVenta,}) 
        {
        return this.prisma.puntoVenta.create({ data });
        }

    update(id: number, data: { nombre?: string, telefono?: string, estado?: EstadoPuntoVenta }) {
        return this.prisma.puntoVenta.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.puntoVenta.delete({
            where: { id }
        })
    }
}
