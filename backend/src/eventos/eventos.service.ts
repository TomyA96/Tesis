import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoEvento } from '@prisma/client';

@Injectable()
export class EventosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.evento.findMany()    
    }

    findOne(id: number) {
        return this.prisma.evento.findUnique({ where: { id } });
    }

    create(data: { 
        nombre: string, 
        fechaHoraInicio: Date, 
        fechaHoraFin?: Date, 
        ubicacion: string, 
        descripcion?: string, 
        estado: EstadoEvento, 
        direccion?: string, 
        capacidad: number }) 
        {
        return this.prisma.evento.create( { data } );
        }

    update(id: number, data: {
        nombre?: string,
        fechaHoraInicio?: Date,
        fechaHoraFin?: Date,
        ubicacion?: string,
        descripcion?: string,
        estado?: EstadoEvento,
        direccion?: string,
        capacidad?: number
    }) {
        return this.prisma.evento.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.evento.delete({ where: { id } });
    }
}
