import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsignarProductosDto } from './dtos/asignar.productos.dto';

@Injectable()
export class ProductoEventoService {
    constructor(private prisma: PrismaService) {}

    // Se aplana a Producto[] (mismo criterio que los rubros de un proveedor)
    async findByEvento(idEvento: number) {
        const filas = await this.prisma.productoEvento.findMany({
            where: { idEvento },
            include: { producto: true },
            orderBy: { producto: { nombre: 'asc' } },
        });

        return filas.map((fila) => fila.producto);
    }

    /*
        Reemplaza la lista completa del evento: se calcula qué productos se agregan
        y cuáles se quitan respecto de lo que ya estaba, y se valida cada grupo.
    */
    async asignar(idEvento: number, data: AsignarProductosDto) {
        const evento = await this.prisma.evento.findUnique({ where: { id: idEvento } });
        if (!evento) {
            throw new NotFoundException('El evento indicado no existe');
        }
        // Mismo criterio que las entradas: un evento cerrado ya es historia
        if (evento.estado === 'Finalizado' || evento.estado === 'Cancelado') {
            throw new ConflictException('No se puede modificar la lista de productos de un evento finalizado o cancelado');
        }
        // Mismo criterio que los movimientos financieros: sin publicar, no tiene sentido
        if (evento.estado === 'Borrador') {
            throw new ConflictException('No se pueden asignar productos a un evento en borrador');
        }

        // Set elimina ids repetidos
        const idsNuevos = [...new Set(data.idsProductos)];

        const asignadosActuales = await this.prisma.productoEvento.findMany({
            where: { idEvento },
            select: { idProducto: true },
        });
        const idsActuales = asignadosActuales.map((fila) => fila.idProducto);

        const idsAgregados = idsNuevos.filter((id) => !idsActuales.includes(id));
        const idsQuitados = idsActuales.filter((id) => !idsNuevos.includes(id));

        // Los que se agregan tienen que existir y estar disponibles. Los que ya estaban
        // no se revalidan: un producto descontinuado después puede seguir en la lista.
        if (idsAgregados.length > 0) {
            const productos = await this.prisma.producto.findMany({
                where: { id: { in: idsAgregados } },
                select: { id: true, nombre: true, estado: true },
            });
            if (productos.length !== idsAgregados.length) {
                throw new BadRequestException('Uno de los productos indicados no existe');
            }
            const descontinuados = productos.filter((producto) => producto.estado === 'Descontinuado');
            if (descontinuados.length > 0) {
                throw new ConflictException(
                    `No se pueden agregar productos descontinuados: ${descontinuados.map((p) => p.nombre).join(', ')}`,
                );
            }
        }

        // Un producto que ya se vendió en el buffet de este evento no se puede sacar de la lista
        if (idsQuitados.length > 0) {
            const vendidos = await this.prisma.detalleVentaBuffet.findMany({
                where: { idProducto: { in: idsQuitados }, ventaBuffet: { idEvento } },
                select: { producto: { select: { nombre: true } } },
                distinct: ['idProducto'],
            });
            if (vendidos.length > 0) {
                throw new ConflictException(
                    `No se pueden quitar productos que ya tienen ventas en este evento: ${vendidos.map((v) => v.producto.nombre).join(', ')}`,
                );
            }
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.productoEvento.deleteMany({ where: { idEvento, idProducto: { in: idsQuitados } } });
            await tx.productoEvento.createMany({
                data: idsAgregados.map((idProducto) => ({ idProducto, idEvento })),
            });
        });

        return this.findByEvento(idEvento);
    }
}
