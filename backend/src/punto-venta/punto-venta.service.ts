import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePuntoVentaDto } from './dtos/create.punto-venta.dto';
import { UpdatePuntoVentaDto } from './dtos/update.punto-venta.dto';

/*
    Los puntos de venta son los locales (quioscos, tiendas, la municipalidad)
    a los que se les reparten tickets físicos para que los vendan. Después
    rinden cuentas de lo que vendieron.
*/
@Injectable()
export class PuntoVentaService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.puntoVenta.findMany({ orderBy: { nombre: 'asc' } });
    }

    findOne(id: number) {
        return this.prisma.puntoVenta.findUnique({ where: { id } });
    }

    private async obtener(id: number) {
        const puntoVenta = await this.findOne(id);
        if (!puntoVenta) {
            throw new NotFoundException('No existe el punto de venta');
        }
        return puntoVenta;
    }

    // PuntoVenta.nombre no es @unique: se controla acá, sin distinguir mayúsculas (igual que proveedores)
    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const existente = await this.prisma.puntoVenta.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });

        if (existente) {
            throw new ConflictException('Ya existe un punto de venta con ese nombre');
        }
    }

    async create(data: CreatePuntoVentaDto) {
        const nombre = data.nombre.trim();
        await this.validarNombreDisponible(nombre);

        // Un punto de venta nuevo siempre nace activo: desactivarlo es una acción posterior
        return this.prisma.puntoVenta.create({
            data: { ...data, nombre, estado: data.estado ?? 'Activo' },
        });
    }

    async update(id: number, data: UpdatePuntoVentaDto) {
        await this.obtener(id);

        const nombre = data.nombre?.trim();
        if (nombre) {
            await this.validarNombreDisponible(nombre, id);
        }

        return this.prisma.puntoVenta.update({
            where: { id },
            data: { ...data, nombre },
        });
    }

    async remove(id: number) {
        await this.obtener(id);

        /*
            Si alguna vez se le asignaron tickets, el local forma parte de la
            historia de esas ventas y rendiciones: no se borra, se desactiva.
        */
        const tickets = await this.prisma.ticketEvento.count({ where: { idPuntoVenta: id } });
        if (tickets > 0) {
            throw new ConflictException(
                'No se puede eliminar: el punto de venta ya tuvo tickets asignados. Desactivalo en vez de eliminarlo',
            );
        }

        return this.prisma.puntoVenta.delete({ where: { id } });
    }
}
