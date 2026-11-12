import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dtos/create.compra.dto';
import { Prisma } from '@prisma/client';
import { limiteVentaOnline } from '../jornadas/utils/venta-online';
import { liberarReservasVencidas } from '../entradas/utils/tickets';

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
                    Filtrar por idEvento deja afuera, sin avisar, entradas de otro evento.
                */
                const idsPedidos = entradas.map((e) => e.idEntrada);
                const entradasPedidas = await tx.entrada.findMany({
                    where: { id: { in: idsPedidos }, jornada: { idEvento } },
                    include: { jornada: true },
                });

                // Una entrada que no apareció no existe o es de otro evento: no se distingue a propósito
                if (entradasPedidas.length !== idsPedidos.length) {
                    throw new NotFoundException('Una o más entradas solicitadas no están disponibles');
                }
                if (entradasPedidas.some((e) => e.jornada.estado !== 'Activo')) {
                    throw new ConflictException('Una de las jornadas seleccionadas no está activa');
                }
                // La venta online cierra unas horas antes del inicio: después, las entradas se venden en la puerta
                if (entradasPedidas.some((e) => e.jornada.fechaHoraInicio <= limiteVentaOnline())) {
                    throw new ConflictException('La venta online de una de las jornadas seleccionadas ya cerró');
                }
                // Solo se pueden comprar online las entradas publicadas, habilitadas y no físicas.
                if (entradasPedidas.some((e) => e.estado !== 'Disponible' || !e.habilitada || e.esFisica)) {
                    throw new NotFoundException('Una o más entradas solicitadas no están disponibles');
                }

                const pedidas = entradas.map((pedida) => ({
                    ...pedida,
                    entrada: entradasPedidas.find((e) => e.id === pedida.idEntrada)!,
                }));

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
                        // Qué entradas y cuántas se pidieron, con el precio de este momento
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

                // Las reservas vencidas de estas entradas vuelven a la venta antes de buscar tickets libres
                await liberarReservasVencidas(tx, idsPedidos);

                /*
                    Los tickets ya existen (se crearon al publicar el lote): comprar
                    es apartar tickets concretos que estén Disponibles. No hace falta
                    controlar la capacidad: el lote nunca tuvo más tickets que lugares.

                    Dos compras a la vez pueden elegir los mismos tickets. El
                    updateMany solo cambia los que SIGUEN Disponibles: la base hace
                    esperar a la segunda hasta que la primera termine, y entonces ya
                    no los encuentra libres. Si apartó menos de los pedidos, otro se
                    los llevó: se cancela todo (la transacción se deshace).
                */
                for (const p of pedidas) {
                    const libres = await tx.ticketEvento.findMany({
                        where: { idEntrada: p.idEntrada, estado: 'Disponible' },
                        orderBy: { id: 'asc' },
                        take: p.cantidad,
                        select: { id: true },
                    });
                    if (libres.length < p.cantidad) {
                        throw new ConflictException(`No quedan suficientes entradas ${p.entrada.descripcion}: quedan ${libres.length}`);
                    }
                    const apartados = await tx.ticketEvento.updateMany({
                        where: { id: { in: libres.map((t) => t.id) }, estado: 'Disponible' },
                        data: { estado: 'Reservado', idOrden: ordenCompra.id, fechaHora: new Date() },
                    });
                    if (apartados.count < p.cantidad) {
                        throw new ConflictException('Hubo mucha demanda en este momento, probá de nuevo');
                    }
                }

                if (total.isZero()) {
                    return await this.aprobarCompra(tx, ordenCompra.id);
                }

                return ordenCompra;

            });
        } catch (err) {
            // P2002: dos compras simultáneas intentaron crear al mismo cliente (DNI único).
            // No es un error del usuario: puede reintentar.
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
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

    /*
        El pago se aprobó: los tickets que la orden tenía apartados pasan a
        Vendido. Si no están todos, la reserva venció y alguien más los compró
        mientras tanto.
    */
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

        const pedidos = orden.detalles.reduce((suma, d) => suma + d.cantidad, 0);
        const vendidos = await tx.ticketEvento.updateMany({
            where: { idOrden, estado: 'Reservado' },
            data: { estado: 'Vendido', fechaHora: new Date() },
        });
        if (vendidos.count !== pedidos) {
            throw new ConflictException('La reserva de esta compra venció y sus entradas se liberaron');
        }

        return await tx.ordenCompra.update({
            where: { id: idOrden },
            data: { estado: 'Aprobada', expiraEn: null },
            include: { detalles: { include: { entrada: { select: { descripcion: true } } } } },
        });
    }
}
