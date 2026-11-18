import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EstadoTicket, MedioPagoBuffet, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaPuertaDto } from './dtos/create.venta-puerta.dto';
import { estaOperable } from '../jornadas/utils/ventana-operacion';
import { pdfDeTickets } from '../entradas/utils/pdf-tickets';

type Db = PrismaService | Prisma.TransactionClient;

/*
    Lugares que cuentan para la capacidad en la puerta: lo vendido (online,
    en locales ya rendidos, en la puerta) y lo que alguien puede traer en la
    mano (impresos y asignados a locales), más las compras online que
    esperan el pago. Los online Disponibles NO cuentan: la venta online
    cerró por horario antes de que abra la boletería, así que ya no se van a
    vender (no se anulan acá: se anulan al finalizar la jornada).
*/
const OCUPAN_EN_PUERTA: EstadoTicket[] = ['Vendido', 'Usado', 'Impreso', 'Asignado', 'Reservado'];

// Desde qué porcentaje la pantalla avisa que la jornada se está llenando
const PORCENTAJE_ALERTA = 80;

const INCLUIR_VENTA = {
    usuario: { select: { nombre: true } },
    usuarioAnulacion: { select: { nombre: true } },
    usuarioReemision: { select: { nombre: true } },
    tickets: { select: { id: true, numero: true, estado: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.VentaPuertaInclude;

/*
    La boletería de una jornada: vende tickets del lote "General Boletería"
    en el momento, y los imprime. Todo cuelga de la jornada (viene en la URL)
    y quien vende sale del token.

    Una venta no se edita ni se borra: se anula (como en el buffet). Tampoco
    se reimprime el mismo QR, porque quedarían dos papeles válidos: si el
    ticket no salió bien, se REEMITE (los tickets de la venta se anulan y se
    crean otros, dentro de la misma venta y sin cobrar de nuevo).
*/
@Injectable()
export class VentaPuertaService {
    constructor(private prisma: PrismaService) {}

    /*
        Lo que necesita la pantalla de la puerta: la boletería configurada (o
        null, y la pantalla avisa que falta configurarla), si se puede vender
        ahora y cómo viene la capacidad.
    */
    async estado(idJornada: number) {
        const jornada = await this.buscarJornada(idJornada);
        const [boleteria, ocupacion] = await Promise.all([
            this.prisma.entrada.findFirst({
                where: { idJornada, esBoleteria: true },
                select: { id: true, descripcion: true, precio: true, habilitada: true },
            }),
            this.ocupacion(this.prisma, jornada.id, jornada.capacidad),
        ]);
        return {
            jornada: { id: jornada.id, estado: jornada.estado, capacidad: jornada.capacidad, operable: estaOperable(jornada) },
            boleteria,
            ocupacion,
        };
    }

    /*
        Cuántos lugares están comprometidos (ver OCUPAN_EN_PUERTA) y cuántos ya
        entraron. El nivel es lo que pinta la pantalla: Normal (azul), Alerta
        (amarillo, desde el 80 %) y Lleno (rojo, desde el 100 %: de ahí en más
        cada venta es una sobreventa que hay que confirmar).
    */
    private async ocupacion(db: Db, idJornada: number, capacidad: number) {
        const deLaJornada = { entrada: { idJornada } };
        const [comprometidos, ingresaron, vendidosEnPuerta] = await Promise.all([
            db.ticketEvento.count({ where: { ...deLaJornada, estado: { in: OCUPAN_EN_PUERTA } } }),
            db.acceso.count({ where: { ticket: deLaJornada } }),
            db.ticketEvento.count({ where: { ...deLaJornada, idVentaPuerta: { not: null }, estado: { in: ['Vendido', 'Usado'] } } }),
        ]);
        const porcentaje = capacidad > 0 ? Math.round((comprometidos / capacidad) * 100) : 100;
        const nivel = comprometidos >= capacidad ? 'Lleno' : porcentaje >= PORCENTAJE_ALERTA ? 'Alerta' : 'Normal';
        return {
            capacidad,
            comprometidos,
            disponibles: Math.max(0, capacidad - comprometidos),
            // Cuántos por encima de la capacidad (0 si no se pasó)
            excedente: Math.max(0, comprometidos - capacidad),
            porcentaje,
            nivel: nivel as 'Normal' | 'Alerta' | 'Lleno',
            ingresaron,
            vendidosEnPuerta,
        };
    }

    // Las ventas de la jornada (la más nueva primero) y los totales de las que valen, como la caja del buffet
    async ventas(idJornada: number) {
        await this.buscarJornada(idJornada);
        const ventas = await this.prisma.ventaPuerta.findMany({
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

        return {
            ventas,
            cantidad: registradas.length,
            tickets: registradas.reduce((suma, v) => suma + v.cantidad, 0),
            sobreventas: registradas.filter((v) => v.esSobreventa).length,
            total: sumar(registradas),
            porMedioPago,
        };
    }

    /*
        Vende `cantidad` tickets de la boletería y devuelve el PDF para
        imprimirlos. Todo pasa en una transacción: si el PDF falla, no queda
        ninguna venta sin su papel.
    */
    async vender(idJornada: number, data: CreateVentaPuertaDto, idUsuario: number) {
        const jornada = await this.buscarJornada(idJornada);
        this.validarOperable(jornada);

        return this.prisma.$transaction(
            async (tx) => {
                const boleteria = await this.bloquearBoleteria(tx, idJornada);
                if (!boleteria.habilitada) {
                    throw new ConflictException('La venta en puerta de esta jornada está pausada');
                }

                // Se cuenta dentro de la transacción: así dos boleterías no ven el mismo número
                const { comprometidos } = await this.ocupacion(tx, idJornada, jornada.capacidad);
                const esSobreventa = comprometidos + data.cantidad > jornada.capacidad;
                if (esSobreventa && !data.confirmarSobreventa) {
                    throw new ConflictException(
                        `Sobreventa: hay ${comprometidos} lugares ocupados sobre una capacidad de ${jornada.capacidad}. ` +
                            'Confirmá la venta bajo responsabilidad del responsable del evento',
                    );
                }

                const precioUnitario = boleteria.precio;
                const venta = await tx.ventaPuerta.create({
                    data: {
                        idJornada,
                        idUsuario,
                        cantidad: data.cantidad,
                        precioUnitario,
                        total: precioUnitario.times(data.cantidad),
                        medioPago: data.medioPago,
                        esSobreventa,
                    },
                });
                const tickets = await this.emitirTickets(tx, boleteria.id, venta.id, idUsuario, precioUnitario, data.cantidad);
                return this.armarPdf(jornada, boleteria.descripcion, tickets);
            },
            { timeout: 20000 },
        );
    }

    /*
        Anular es para corregir un error de la caja, así que solo se puede
        mientras la jornada se está operando. Sus tickets se anulan (el
        control de acceso los rechaza). Si alguno ya entró, la venta existió:
        no se anula.
    */
    async anular(idJornada: number, idVenta: number, idUsuario: number) {
        const jornada = await this.buscarJornada(idJornada);
        this.validarOperable(jornada);

        return this.prisma.$transaction(async (tx) => {
            const venta = await this.buscarVenta(tx, idJornada, idVenta);
            if (venta.tickets.some((t) => t.estado === 'Usado')) {
                throw new ConflictException('Algún ticket de esta venta ya se usó para entrar: la venta no se puede anular');
            }
            // La condición sobre el estado es el candado: si dos personas anulan a la vez, solo una lo consigue
            const anulada = await tx.ventaPuerta.updateMany({
                where: { id: idVenta, estado: 'Registrada' },
                data: { estado: 'Anulada', idUsuarioAnulacion: idUsuario, fechaAnulacion: new Date() },
            });
            if (anulada.count === 0) {
                throw new ConflictException('La venta ya estaba anulada');
            }
            await tx.ticketEvento.updateMany({
                where: { idVentaPuerta: idVenta, estado: 'Vendido' },
                data: { estado: 'Anulado' },
            });
            return tx.ventaPuerta.findUnique({ where: { id: idVenta }, include: INCLUIR_VENTA });
        });
    }

    /*
        Reemitir: cuando el papel no salió (se trabó la impresora, se rompió).
        Los tickets de la venta que todavía no entraron se anulan y se crean
        otros tantos, con números y QR nuevos: el papel viejo ya no sirve en
        la puerta. No es una venta nueva: el total y la caja no cambian. Queda
        quién lo hizo, cuándo y cuántas veces.
    */
    async reemitir(idJornada: number, idVenta: number, idUsuario: number) {
        const jornada = await this.buscarJornada(idJornada);
        this.validarOperable(jornada);

        return this.prisma.$transaction(
            async (tx) => {
                const boleteria = await this.bloquearBoleteria(tx, idJornada);
                const venta = await this.buscarVenta(tx, idJornada, idVenta);
                if (venta.estado !== 'Registrada') {
                    throw new ConflictException('La venta está anulada: no se puede reemitir');
                }
                const vigentes = venta.tickets.filter((t) => t.estado === 'Vendido');
                if (vigentes.length === 0) {
                    throw new ConflictException('Todos los tickets de esta venta ya se usaron para entrar: no hay nada para reemitir');
                }

                const { count } = await tx.ticketEvento.updateMany({
                    where: { id: { in: vigentes.map((t) => t.id) }, estado: 'Vendido' },
                    data: { estado: 'Anulado' },
                });
                if (count !== vigentes.length) {
                    throw new ConflictException('Algún ticket de la venta cambió mientras tanto. Recargá la pantalla y probá de nuevo');
                }
                await tx.ventaPuerta.update({
                    where: { id: idVenta },
                    data: { reemisiones: { increment: 1 }, idUsuarioReemision: idUsuario, fechaReemision: new Date() },
                });

                // Mismo precio que se cobró, aunque el de la boletería haya cambiado después
                const tickets = await this.emitirTickets(tx, boleteria.id, idVenta, venta.idUsuario, venta.precioUnitario, vigentes.length);
                return this.armarPdf(jornada, boleteria.descripcion, tickets);
            },
            { timeout: 20000 },
        );
    }

    /*
        Trae la boletería de la jornada y bloquea su fila hasta que termine la
        transacción (FOR UPDATE): si dos boleterías venden a la vez, la
        segunda espera a la primera. Así los números de ticket no se repiten
        y la cuenta de capacidad ve lo que la otra acaba de vender.
    */
    private async bloquearBoleteria(tx: Prisma.TransactionClient, idJornada: number) {
        const boleteria = await tx.entrada.findFirst({ where: { idJornada, esBoleteria: true } });
        if (!boleteria) {
            throw new ConflictException('Esta jornada no tiene configurada la venta en puerta. Configurala desde el evento, en «Configurar boletería»');
        }
        await tx.$queryRaw`SELECT id FROM entradas WHERE id = ${boleteria.id} FOR UPDATE`;
        return boleteria;
    }

    /*
        Crea los tickets vendidos, numerados a continuación de los que ya
        tiene la boletería. Los tickets nunca se borran (se anulan), así que
        contar todos da el último número usado.
    */
    private async emitirTickets(
        tx: Prisma.TransactionClient,
        idEntrada: number,
        idVentaPuerta: number,
        idVendedor: number,
        precio: Prisma.Decimal,
        cantidad: number,
    ) {
        const yaEmitidos = await tx.ticketEvento.count({ where: { idEntrada } });
        const tickets = Array.from({ length: cantidad }, (_, i) => ({
            idEntrada,
            idVentaPuerta,
            idVendedor,
            codigoQR: randomUUID(),
            numero: String(yaEmitidos + i + 1),
            precio,
            estado: 'Vendido' as const,
        }));
        await tx.ticketEvento.createMany({ data: tickets });
        return tickets;
    }

    private armarPdf(jornada: { fechaHoraInicio: Date; evento: { nombre: string } }, descripcion: string, tickets: { numero: string; codigoQR: string }[]) {
        return pdfDeTickets({ evento: jornada.evento.nombre, descripcion, fechaJornada: jornada.fechaHoraInicio }, tickets);
    }

    private async buscarVenta(db: Db, idJornada: number, idVenta: number) {
        const venta = await db.ventaPuerta.findUnique({ where: { id: idVenta }, include: { tickets: { select: { id: true, estado: true } } } });
        if (!venta || venta.idJornada !== idJornada) {
            throw new NotFoundException('La venta no existe en esta jornada');
        }
        return venta;
    }

    private async buscarJornada(idJornada: number) {
        const jornada = await this.prisma.jornada.findUnique({ where: { id: idJornada }, include: { evento: { select: { nombre: true } } } });
        if (!jornada) {
            throw new NotFoundException('La jornada no existe');
        }
        return jornada;
    }

    // Misma ventana que accesos y buffet (ver ventana-operacion.ts)
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
