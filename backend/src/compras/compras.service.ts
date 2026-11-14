import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dtos/create.compra.dto';
import { EstadoOrden, Prisma } from '@prisma/client';
import { limiteVentaOnline } from '../jornadas/utils/venta-online';
import { liberarReservasVencidas } from '../entradas/utils/tickets';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';

// Cuánto tiempo quedan reservadas las entradas de una compra con pago pendiente
const MINUTOS_RESERVA = 10;

@Injectable()
export class ComprasService {
    private readonly logger = new Logger(ComprasService.name);

    constructor(
        private prisma: PrismaService,
        private mercadoPago: MercadoPagoService,
    ) {}

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
                    throw new ConflictException('Uno de los eventos seleccionados no está activo');
                }
                // La venta online cierra unas horas antes del inicio: después, las entradas se venden en la puerta
                if (entradasPedidas.some((e) => e.jornada.fechaHoraInicio <= limiteVentaOnline())) {
                    throw new ConflictException('La venta online de uno de los eventos seleccionados ya cerró');
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
        // cobrar), acá, fuera de la transacción, se le pide el link de pago a Mercado Pago.
        // Va afuera a propósito: una llamada a otro servicio puede tardar o fallar, y no
        // conviene tener la base de datos trabada esperándola.
        if (ordenRegistrada.estado === 'Pendiente') {
            let order;
            try {
                order = await this.mercadoPago.crearOrder({
                    idOrden: ordenRegistrada.id,
                    total: ordenRegistrada.total,
                    emailComprador: comprador.email,
                    minutosVigencia: MINUTOS_RESERVA,
                    items: ordenRegistrada.detalles.map((d) => ({
                        titulo: d.entrada.descripcion,
                        cantidad: d.cantidad,
                        precioUnitario: d.precioUnitario,
                    })),
                });
            } catch (err) {
                // Sin link de pago el cliente no puede pagar: se libera lo que se había reservado
                await this.cancelarOrdenSinCobro(ordenRegistrada.id);
                throw err;
            }

            // Se guarda el id de la order de Mercado Pago: es como el aviso de pago encuentra esta orden
            return await this.prisma.ordenCompra.update({
                where: { id: ordenRegistrada.id },
                data: { idOrdenMercadoPago: order.idOrdenMercadoPago, urlPago: order.urlPago },
                include: { detalles: { include: { entrada: { select: { descripcion: true } } } } },
            });
        }

        return ordenRegistrada;
    }

    /*
        La orden no se pudo cobrar (Mercado Pago no respondió): se cancela y
        sus tickets reservados vuelven a la venta. Solo si sigue Pendiente,
        para no pisar una orden que ya cambió de estado.
    */
    private async cancelarOrdenSinCobro(idOrden: number) {
        await this.prisma.$transaction(async (tx) => {
            const cancelada = await tx.ordenCompra.updateMany({
                where: { id: idOrden, estado: 'Pendiente' },
                data: { estado: 'Cancelada', expiraEn: null },
            });
            if (cancelada.count === 0) return;
            await tx.ticketEvento.updateMany({
                where: { idOrden, estado: 'Reservado' },
                data: { estado: 'Disponible', idOrden: null },
            });
        });
    }

    /*
        Para la pantalla a la que el cliente vuelve después de pagar: confirma
        con Mercado Pago cómo quedó el pago y devuelve el estado de la orden.
        No hace falta esperar al aviso (webhook): si llegó antes, ya está
        aprobada; si no, se aprueba acá.
    */
    async estadoDeCompra(idOrden: number) {
        const estado = await this.sincronizarPago(idOrden);
        return { id: idOrden, estado };
    }

    // El aviso (webhook) de Mercado Pago dice que algo cambió en una order suya: se busca la nuestra.
    async sincronizarPorIdMercadoPago(idOrdenMercadoPago: string) {
        const orden = await this.prisma.ordenCompra.findUnique({
            where: { idOrdenMercadoPago },
            select: { id: true },
        });
        if (!orden) {
            this.logger.warn(`Aviso de Mercado Pago por una order que no conocemos: ${idOrdenMercadoPago}`);
            return;
        }
        await this.sincronizarPago(orden.id);
    }

    /*
        Le pregunta a Mercado Pago cómo quedó el pago y actualiza la orden en
        consecuencia. Se puede llamar las veces que haga falta (el aviso y la
        pantalla de retorno pueden coincidir): si la orden ya está resuelta, no
        hace nada.
    */
    private async sincronizarPago(idOrden: number): Promise<EstadoOrden> {
        const orden = await this.prisma.ordenCompra.findUnique({
            where: { id: idOrden },
            select: { id: true, estado: true, total: true, idOrdenMercadoPago: true },
        });
        if (!orden) {
            throw new NotFoundException('Orden de compra no encontrada');
        }
        // Ya aprobada, o sin cobro de Mercado Pago (gratuita): no hay nada que consultar
        if (orden.estado === 'Aprobada' || !orden.idOrdenMercadoPago) {
            return orden.estado;
        }

        const mp = await this.mercadoPago.consultarOrder(orden.idOrdenMercadoPago);

        // El pago está acreditado
        if (mp.status === 'processed' && mp.statusDetail === 'accredited') {
            // Se cobró otro monto que el de la orden: no se aprueba hasta revisarlo
            if (!new Prisma.Decimal(mp.totalAmount || 0).equals(orden.total)) {
                this.logger.error(`La orden ${orden.id} se cobró por ${mp.totalAmount} y su total es ${orden.total}: no se aprobó`);
                return orden.estado;
            }
            // Pagaron, pero la orden ya se había cancelado y sus entradas se liberaron: hay que devolverles el dinero
            if (orden.estado === 'Cancelada') {
                this.logger.error(`DEVOLVER DINERO: la orden ${orden.id} se pagó en Mercado Pago (${orden.idOrdenMercadoPago}) pero ya estaba cancelada`);
                return orden.estado;
            }
            try {
                await this.prisma.$transaction((tx) => this.aprobarCompra(tx, orden.id));
                return 'Aprobada';
            } catch (err) {
                if (!(err instanceof ConflictException)) throw err;
                // O la aprobó otro aviso justo antes, o la reserva venció. Se mira cómo quedó.
                const actual = await this.prisma.ordenCompra.findUnique({ where: { id: orden.id }, select: { estado: true } });
                if (actual?.estado === 'Aprobada') return 'Aprobada';
                this.logger.error(`DEVOLVER DINERO: la orden ${orden.id} se pagó (${orden.idOrdenMercadoPago}) pero no se pudo aprobar: ${err.message}`);
                return actual?.estado ?? orden.estado;
            }
        }

        // Mercado Pago la canceló (venció sin pago): se libera lo reservado
        if (mp.status === 'canceled' && orden.estado === 'Pendiente') {
            await this.cancelarOrdenSinCobro(orden.id);
            return 'Cancelada';
        }

        // Cualquier otro estado (creada, en proceso, rechazo de un intento…): la orden sigue como está
        return orden.estado;
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
