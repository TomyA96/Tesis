import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EstadoEntrada } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntradaDto } from './dtos/create.entrada.dto';
import { UpdateEntradaDto } from './dtos/update.entrada.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class EntradasService {
    constructor(private prisma: PrismaService) {}

    async findAll(idEvento: number) {
        const entradas = await this.prisma.entrada.findMany({
            where: { idEvento },
            include: { _count: { select: { tickets: true } } },
        });

        return entradas.map((entrada) => {
            const { _count, ...resto } = entrada;
            return { ...resto, cantidadTicket: _count.tickets };
        });
    }


    findOne(id: number) {
        return this.prisma.entrada.findUnique({ where: { id } });
    }

    async createEntrada(data: CreateEntradaDto) {
        const evento = await this.prisma.evento.findUnique({ where: { id: data.idEvento } });
        if (!evento) {
            throw new NotFoundException('No existe el evento al que intentas asociar la entrada');
        }
        if (evento.estado === "Finalizado" || evento.estado === "Cancelado") {
            throw new ConflictException('No se puede crear una entrada para un evento finalizado o cancelado');
        }
        await this.validarDescripcionDisponible(data.idEvento,data.descripcion)
        return this.prisma.entrada.create({ data });
    }

    async updateEntrada(id: number, data: UpdateEntradaDto) {
        const entrada = await this.findOne(id);
        if (entrada && data.descripcion) {
            await this.validarDescripcionDisponible(entrada?.idEvento, data.descripcion, id )
        }
        
        return this.prisma.entrada.update({
            where: { id },
            data
        })
    }


    async publicarEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: { id },
            include: { evento: true },
         
        })

        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if (entrada.evento.estado !== "Activo") {
            throw new ConflictException('No se puede publicar una entrada de un evento que no está activo');
        }
        if (entrada.estado !== "Borrador") {
            throw new ConflictException('No se puede publicar esta entrada');
        }
        if (!entrada.habilitada) {
            throw new ConflictException('No se puede publicar una entrada deshabilitada');
        }
        return this.prisma.entrada.update({
            where: { id },
            data: { estado: "Disponible" }
        })
    }

    habilitarEntrada(id: number, ) {
        return this.prisma.entrada.update({
            where: { id },
            data: {habilitada: true}
        })
    }

    deshabilitarEntrada(id: number) {
        return this.prisma.entrada.update({
            where: { id },
            data: {habilitada: false}
        })
    }

    async imprimirEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: { id },
            include: { 
                evento: true,
                _count: { select: { tickets: true } }
            },    
        })
        
        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if (entrada._count.tickets > 0){
            throw new ConflictException('Estos tickets ya fueron impresos, no se pueden volver a imprimir');
        }
        if (entrada.evento.estado !== "Activo") {
            throw new ConflictException('No se puede imprimir una entrada de un evento que no está activo');
        }
        if (entrada.estado !== "Disponible") {
            throw new ConflictException('No se puede imprimir esta entrada todavia');
        }
        if (!entrada.habilitada) {
            throw new ConflictException('No se puede imprimir una entrada deshabilitada');
        }
        if (!entrada.esFisica) {
            throw new ConflictException('No se puede imprimir una entrada que no es física');
        }
        if (entrada.cantidad === null || entrada.cantidad <= 0) {
            throw new ConflictException('No se puede imprimir una entrada física sin cantidad definida');
        }
        const nuevosTickets = Array.from({length: entrada.cantidad},(_, i) => ({
            idEntrada: entrada.id,
            codigoQR: randomUUID() ,
            numero: String(i + 1),
            precio: entrada.precio,
            estado: "Impreso" as const,
            
        }));
        const tickets = await this.prisma.ticketEvento.createMany({
            data: nuevosTickets,
        })
        return tickets
    }


    async deleteEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: {id},
            include:{ _count: { select: { tickets: true}}}
        })
        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if(entrada._count.tickets > 0){
            throw new ConflictException('No se puede eliminar la entrada porque tiene tickets asociados');
        }
        if (entrada.estado !== "Borrador" && entrada.habilitada) {
            throw new ConflictException('No se puede eliminar esta entrada');
        }
        return this.prisma.entrada.delete({ where: { id } });
    }

    private async validarDescripcionDisponible(idEvento: number, descripcion: string, idIgnorado?: number) {
        const existente = await this.prisma.entrada.findFirst({
            where: {
                idEvento,
                descripcion: { equals: descripcion, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });
        if (existente) {
            throw new ConflictException('Ya existe una entrada con ese nombre para este evento');
        }
    }
   
}
