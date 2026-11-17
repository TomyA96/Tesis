import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MedioPagoBuffet, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaBuffetDto } from './dtos/create.venta-buffet.dto';
import { estaOperable } from '../jornadas/utils/ventana-operacion';

// Lo que se muestra de cada venta en la lista de la caja
const INCLUIR_VENTA = {
    usuario: { select: { nombre: true } },
    usuarioAnulacion: { select: { nombre: true } },
    detalleVenta: {
        select: { cantidad: true, precioUnitario: true, subtotal: true, producto: { select: { id: true, nombre: true } } },
        orderBy: { producto: { nombre: 'asc' } },
    },
} satisfies Prisma.VentaBuffetInclude;

/*
    Ventas del buffet de una jornada. Todo cuelga de la jornada (viene en la
    URL) y quien vende sale del token.

    Una venta no se edita ni se borra: si está mal, se anula. La anulada queda
    registrada (quién y cuándo) pero deja de contar en el total de la caja y
    en los informes.
*/
@Injectable()
export class VentaBuffetService {
    constructor(private prisma: PrismaService) {}

    // El catálogo de la caja: los productos asignados al evento de la jornada que siguen a la venta
    async productos(idJornada: number) {
        const jornada = await this.buscarJornada(idJornada);
        const asignados = await this.prisma.productoEvento.findMany({
            where: { idEvento: jornada.idEvento, producto: { estado: 'Disponible' } },
            include: { producto: true },
            orderBy: { producto: { nombre: 'asc' } },
        });
        return asignados.map((a) => a.producto);
    }

    /*
        Las ventas de la jornada, de la más nueva a la más vieja, y los totales
        de las que valen (las anuladas no suman): el total general y por medio
        de pago, que es lo que se controla al cerrar la caja.
    */
    async ventas(idJornada: number) {
        await this.buscarJornada(idJornada);
        const ventas = await this.prisma.ventaBuffet.findMany({
            where: { idJornada },
            include: INCLUIR_VENTA,
            orderBy: { id: 'desc' },
        });

        const registradas = ventas.filter((v) => v.estado === 'Registrada');
        const sumar = (lista: typeof ventas) => lista.reduce((suma, v) => suma.plus(v.total), new Prisma.Decimal(0));
        const porMedioPago = Object.values(MedioPagoBuffet).map((medio) => ({
            medioPago: medio,
            total: sumar(registradas.filter((v) => v.medioPago === medio)),
        }));

        return { ventas, cantidad: registradas.length, total: sumar(registradas), porMedioPago };
    }

    async registrar(idJornada: number, data: CreateVentaBuffetDto, idUsuario: number) {
        const jornada = await this.buscarJornada(idJornada);
        this.validarOperable(jornada);

        // Un mismo producto en dos renglones es casi seguro un error de la pantalla: se rechaza en vez de adivinar
        const ids = data.items.map((i) => i.idProducto);
        if (new Set(ids).size !== ids.length) {
            throw new BadRequestException('Hay un producto repetido en la venta');
        }

        const asignados = await this.prisma.productoEvento.findMany({
            where: { idEvento: jornada.idEvento, idProducto: { in: ids } },
            include: { producto: true },
        });
        const productoDe = new Map(asignados.map((a) => [a.idProducto, a.producto]));
        const faltantes = ids.filter((id) => !productoDe.has(id));
        if (faltantes.length > 0) {
            throw new ConflictException('Hay productos que no están asignados a este evento');
        }
        const descontinuados = asignados.filter((a) => a.producto.estado !== 'Disponible').map((a) => a.producto.nombre);
        if (descontinuados.length > 0) {
            throw new ConflictException(`Estos productos ya no se venden: ${descontinuados.join(', ')}`);
        }

        // Precios de la base, con Decimal para no perder centavos al multiplicar y sumar
        const detalles = data.items.map((item) => {
            const precioUnitario = new Prisma.Decimal(productoDe.get(item.idProducto)!.precio);
            return { idProducto: item.idProducto, cantidad: item.cantidad, precioUnitario, subtotal: precioUnitario.times(item.cantidad) };
        });
        const total = detalles.reduce((suma, d) => suma.plus(d.subtotal), new Prisma.Decimal(0));

        // La venta y sus renglones se guardan juntos (create anidado): todo o nada
        return this.prisma.ventaBuffet.create({
            data: {
                idJornada,
                idUsuario,
                medioPago: data.medioPago,
                total,
                detalleVenta: { create: detalles },
            },
            include: INCLUIR_VENTA,
        });
    }

    /*
        Anular es para corregir un error de la caja, así que solo se puede
        mientras la jornada se está operando. Queda quién la anuló y cuándo.
    */
    async anular(idJornada: number, idVenta: number, idUsuario: number) {
        const jornada = await this.buscarJornada(idJornada);
        this.validarOperable(jornada);

        const venta = await this.prisma.ventaBuffet.findUnique({ where: { id: idVenta } });
        if (!venta || venta.idJornada !== idJornada) {
            throw new NotFoundException('La venta no existe en esta jornada');
        }
        // La condición sobre el estado es el candado: si dos cajas anulan a la vez, solo una lo consigue
        const anulada = await this.prisma.ventaBuffet.updateMany({
            where: { id: idVenta, estado: 'Registrada' },
            data: { estado: 'Anulada', idUsuarioAnulacion: idUsuario, fechaAnulacion: new Date() },
        });
        if (anulada.count === 0) {
            throw new ConflictException('La venta ya estaba anulada');
        }
        return this.prisma.ventaBuffet.findUnique({ where: { id: idVenta }, include: INCLUIR_VENTA });
    }

    private async buscarJornada(idJornada: number) {
        const jornada = await this.prisma.jornada.findUnique({ where: { id: idJornada } });
        if (!jornada) {
            throw new NotFoundException('La jornada no existe');
        }
        return jornada;
    }

    // Misma ventana que accesos y venta en puerta (ver ventana-operacion.ts)
    private validarOperable(jornada: Parameters<typeof estaOperable>[0]) {
        if (!estaOperable(jornada)) {
            throw new ConflictException(
                jornada.estado === 'Activo'
                    ? 'La jornada no está habilitada para vender en este horario'
                    : `La jornada no está habilitada para vender (estado: ${jornada.estado})`,
            );
        }
    }
}
