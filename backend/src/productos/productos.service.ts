import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dtos/create.producto.dto';
import { UpdateProductoDto } from './dtos/update.producto.dto';

@Injectable()
export class ProductosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
    }

    findOne(id: number) {
        return this.prisma.producto.findUnique({ where: { id } });
    }

    // Producto.nombre no es @unique en el schema: mismo criterio que rubros y proveedores.
    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const existente = await this.prisma.producto.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });

        if (existente) {
            throw new ConflictException('Ya existe un producto con ese nombre');
        }
    }

    async create(data: CreateProductoDto) {
        const { estado, ...datosProducto } = data;

        await this.validarNombreDisponible(data.nombre);

        return this.prisma.producto.create({
            data: { ...datosProducto, estado: estado ?? 'Disponible' },
        });
    }

    async update(id: number, data: UpdateProductoDto) {
        const producto = await this.findOne(id);
        if (!producto) {
            throw new NotFoundException('No existe el producto que intentás editar');
        }

        if (data.nombre) {
            await this.validarNombreDisponible(data.nombre, id);
        }

        return this.prisma.producto.update({ where: { id }, data });
    }

    async remove(id: number) {
        const producto = await this.findOne(id);
        if (!producto) {
            throw new NotFoundException('No existe el producto que intentás eliminar');
        }

        /*
            Un producto que ya se vendió es parte del historial del buffet: si lo
            borráramos, esas ventas quedarían apuntando a la nada. En ese caso el
            camino correcto es marcarlo como Descontinuado.
        */
        const ventas = await this.prisma.detalleVentaBuffet.count({ where: { idProducto: id } });
        if (ventas !== 0) {
            throw new ConflictException(
                'No se puede eliminar: el producto tiene ventas registradas. Marcalo como Descontinuado en vez de eliminarlo',
            );
        }

        const eventos = await this.prisma.productoEvento.count({ where: { idProducto: id } });
        if (eventos !== 0) {
            throw new ConflictException('No se puede eliminar: el producto está asignado a uno o más eventos');
        }

        return this.prisma.producto.delete({ where: { id } });
    }
}
