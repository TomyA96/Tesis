import { Injectable } from '@nestjs/common';
import { EstadoTicket } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketEventoService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.ticketEvento.findMany();
    }

    findOne(id: number) {
        return this.prisma.ticketEvento.findUnique({ where: { id } });
    }

    create(data: {
        idEntrada: number,
        idOrden?: number,
        idPuntoVenta?: number,
        codigoQR: string,
        numero: string,
        precio: number,
        fechaHora?: Date,
        estado: EstadoTicket,
    }) {
        return this.prisma.ticketEvento.create({ data });
    }

    update(id: number, data: {
        idEntrada?: number,
        idOrden?: number,
        idPuntoVenta?: number,
        codigoQR?: string,
        numero?: string,
        precio?: number,
        fechaHora?: Date,
        estado?: EstadoTicket,
    }) {
        return this.prisma.ticketEvento.update({
            where: { id },
            data
        })
    }

    remove(id: number) {
        return this.prisma.ticketEvento.delete({
            where: { id }
        })
    }
}
