import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dtos/create.compra.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { limiteVentaOnline } from '../jornadas/utils/venta-online';

@Injectable()
export class ComprasService {
    constructor(private prisma: PrismaService) {}

    async createCompra(compraData: CreateCompraDto) {
        // Lógica para crear una compra en la base de datos usando Prisma
        const { idEvento, entradas, comprador } = compraData;

        const hayRepetidas = new Set(entradas.map((e) => e.idEntrada)).size !== entradas.length;

        if (hayRepetidas) {
            throw new BadRequestException('Error de envio de datos');
        }

        // let y no const: se asigna adentro del try, pero se usa después de él
        // (una const declarada dentro del try no existe fuera de sus llaves).
        let ordenRegistrada;
        try {
            ordenRegistrada = await this.prisma.$transaction( async (tx) => {
                /*
                    Una compra puede incluir entradas de varias jornadas del mismo evento.
                    Se traen las jornadas que contienen alguna de las entradas pedidas,
                    con TODAS sus entradas: la capacidad se controla por jornada y hay que
                    saber cuánto tiene ocupado cada una (vendidos + reservas en curso).
                    Filtrar por idEvento deja afuera, sin avisar, entradas de otro evento.
                */
                const idsPedidos = entradas.map((e) => e.idEntrada);
                const jornadas = await tx.jornada.findMany({
                    where: {
                        idEvento,
                        entradas: { some: { id: { in: idsPedidos } } },
                    },
                    include: { entradas: {
                        include: { _count: {
                            select: { tickets: { where:
                                { estado: {notIn: ['Reembolsado', 'Anulado']}}}}
                        },
                        detallesOrden: {
                            where: { orden: { estado: 'Pendiente', expiraEn: { gt: new Date() } } },
                            select: { cantidad: true },
                        },
                    }
                    } },
                });

                const jornadasConOcupacion = jornadas.map((jornada) => ({
                    ...jornada,
                    entradas: jornada.entradas.map((e) => ({
                        ...e,
                        ocupadas: e._count.tickets + e.detallesOrden.reduce((suma, d) => suma + d.cantidad, 0),
                    })),
                }));
                const entradasConOcupacion = jornadasConOcupacion.flatMap((j) => j.entradas);

                // Una entrada que no apareció no existe o es de otro evento: no se distingue a propósito
                const idsEncontrados = new Set(entradasConOcupacion.map((e) => e.id));
                if (idsPedidos.some((id) => !idsEncontrados.has(id))) {
                    throw new NotFoundException('Una o más entradas solicitadas no están disponibles');
                }

                if (jornadasConOcupacion.some((j) => j.estado !== 'Activo')) {
                    throw new ConflictException('Una de las jornadas seleccionadas no está activa');
                }
                // La venta online cierra unas horas antes del inicio: después, las entradas se venden en la puerta
                if (jornadasConOcupacion.some((j) => j.fechaHoraInicio <= limiteVentaOnline())) {
                    throw new ConflictException('La venta online de una de las jornadas seleccionadas ya cerró');
                }

                // Solo se pueden comprar online las entradas publicadas, habilitadas y no físicas.
                const entradasVendibles = entradasConOcupacion.filter(
                    (e) => e.estado === 'Disponible' && e.habilitada && !e.esFisica
                );
                const pedidas = entradas.map((pedida) => {
                    const entrada = entradasVendibles.find((e) => e.id === pedida.idEntrada);

                    if (!entrada) {
                        throw new NotFoundException('Una o más entradas solicitadas no están disponibles');
                    }

                    if (entrada.cantidad !== null && (pedida.cantidad + entrada.ocupadas) > entrada.cantidad) {
                        throw new ConflictException(`La cantidad de entradas  ${entrada.descripcion} excede la disponible, o se agotaron`);
                    }

                    return { ...pedida, entrada };
                });

                // La capacidad es de cada jornada: se suma lo ocupado y lo pedido jornada por jornada
                for (const jornada of jornadasConOcupacion) {
                    const ocupadas = jornada.entradas.reduce((suma, e) => suma + e.ocupadas, 0);
                    const solicitadas = pedidas
                        .filter((p) => p.entrada.idJornada === jornada.id)
                        .reduce((suma, p) => suma + p.cantidad, 0);

                    if ((ocupadas + solicitadas) > jornada.capacidad) {
                        throw new ConflictException('No hay suficientes entradas disponibles');
                    }
                }

                const total = pedidas.reduce(
                    (suma, p) => suma.plus(p.entrada.precio.mul(p.cantidad)),
                    new Prisma.Decimal(0),
                );

                const cliente = await tx.cliente.upsert({
                    where: { dni: comprador.dni },
                    update: {
                        nombre: comprador.nombre,
                        email: comprador.email,
                        telefono: comprador.telefono || undefined,
                    },
                    create: {
                        nombre: comprador.nombre,
                        dni: comprador.dni,
                        email: comprador.email,
                        telefono: comprador.telefono || null,
                    },
                })
                const MINUTOS_RESERVA = 10; // Tiempo de reserva para compras con pago pendiente
                const ordenCompra = await tx.ordenCompra.create({
                    data: {
                        idCliente: cliente.id,
                        canal: 'Online',
                        total: total,
                        estado: 'Pendiente',
                        expiraEn: total.isZero() ? null : new Date(Date.now() + MINUTOS_RESERVA * 60 * 1000),
                        // Se guarda qué entradas y cuántas se pidieron (con el precio de este
                        // momento) para saber qué tickets generar cuando se apruebe el pago.
                        detalles: {
                            create: pedidas.map((p) => ({
                                idEntrada: p.idEntrada,
                                cantidad: p.cantidad,
                                precioUnitario: p.entrada.precio,
                                subtotal: p.entrada.precio.mul(p.cantidad),
                            })),
                        },
                    },
                    include: {
                        detalles: { include: { entrada: { select: { descripcion: true } } } },
                    },
                });

                if (total.isZero()) {
                    return await this.aprobarCompra(tx, ordenCompra.id);
                }

                return ordenCompra;

            },{ isolationLevel: 'Serializable' });
        } catch (err) {
            // P2034: dos compras simultáneas chocaron y la base de datos abortó una
            // (aislamiento Serializable). No es un error del usuario: puede reintentar.
            // P2002: dos compras simultáneas intentaron crear al mismo cliente (DNI único)
            // o el mismo número de ticket; mismo origen, mismo tratamiento.
            if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === 'P2034' || err.code === 'P2002')) {
                throw new ConflictException('Hubo mucha demanda en este momento, probá de nuevo');
            }
            throw err;
        }

        // La transacción ya terminó: la orden está guardada. Si quedó Pendiente (hay algo para
        // cobrar), acá, fuera de la transacción, va la llamada a Mercado Pago.
        if (ordenRegistrada.estado === 'Pendiente') {
            // TODO Mercado Pago: pedir el link de pago con el id de la orden como referencia.
            // Si falla, pasar la orden a Cancelada (libera la reserva) y avisar al usuario.
        }

        return ordenRegistrada;
    }

    async aprobarCompra(tx: Prisma.TransactionClient, idOrden: number) {
        const orden = await tx.ordenCompra.findUnique({
            where: { id: idOrden },
            include: { detalles: true },
        });

        if (!orden) {
            throw new NotFoundException('Orden de compra no encontrada');
        }

        if (orden.estado !== 'Pendiente') {
            throw new ConflictException('La orden de compra ya fue procesada');
        }
        for (const detalle of orden.detalles) {
            const ultimaEntradaNumerada = await tx.entrada.findUnique({
                where: { id: detalle.idEntrada },
                include: { _count: { select: { tickets: true } } },
            });

            const nuevosTickets = Array.from({ length: detalle.cantidad }, (_, i) => ({
                idEntrada: detalle.idEntrada,
                idOrden: orden.id,
                codigoQR: randomUUID() ,
                precio: detalle.precioUnitario,
                numero: String((ultimaEntradaNumerada?._count.tickets ?? 0) + i + 1),
                estado: 'Vendido' as const,
            }))

            await tx.ticketEvento.createMany({
                data: nuevosTickets,
            });
        }

        return await tx.ordenCompra.update({
            where: { id: idOrden },
            data: { estado: 'Aprobada', expiraEn: null },
            include: { detalles: { include: { entrada: { select: { descripcion: true } } } } },
        });


    }
}
