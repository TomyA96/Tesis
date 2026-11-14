import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { UpdateEventoDto } from './dtos/update.evento.dto';
import { ImagenEventoService } from '../imagen-evento/imagen-evento.service';
import { JornadasService } from '../jornadas/jornadas.service';
import { limiteVentaOnline } from '../jornadas/utils/venta-online';
import { anularTicketsSinVender, ticketsSinRendir } from '../entradas/utils/tickets';

type ConJornadas = { jornadas: { fechaHoraInicio: Date; fechaHoraFin: Date }[] };

@Injectable()
export class EventosService {
    constructor(private prisma: PrismaService, private imagenEventoService: ImagenEventoService, private jornada: JornadasService) {}

    /*
        El estado del evento se guarda y lo decide el organizador (publicar,
        finalizar): nunca cambia solo. Lo que sí se calcula son las fechas: el
        inicio es el de la primera jornada y el fin el de la que termina última.
    */
    private resumir<T extends ConJornadas>(evento: T) {
        const inicios = evento.jornadas.map((j) => j.fechaHoraInicio.getTime());
        const fines = evento.jornadas.map((j) => j.fechaHoraFin.getTime());
        return {
            ...evento,
            fechaHoraInicio: new Date(Math.min(...inicios)),
            fechaHoraFin: new Date(Math.max(...fines)),
        };
    }

    // Prisma no puede ordenar eventos por la fecha de su primera jornada, se ordena acá
    private porFechaDeInicio<T extends { fechaHoraInicio: Date }>(eventos: T[]) {
        return eventos.sort((a, b) => a.fechaHoraInicio.getTime() - b.fechaHoraInicio.getTime());
    }

    private jornadasOrdenadas = { orderBy: { fechaHoraInicio: 'asc' } } as const;

    // Las jornadas que el público puede comprar ahora: activas y con la venta online todavía abierta
    private jornadasVendibles() {
        return { estado: 'Activo', fechaHoraInicio: { gt: limiteVentaOnline() } } as const;
    }

    async findAll() {
        const eventos = await this.prisma.evento.findMany({ include: { jornadas: this.jornadasOrdenadas } });
        return this.porFechaDeInicio(eventos.map((e) => this.resumir(e)));
    }

    /*
        Un evento todavía en Borrador no se decidió hacer, así que no tiene
        sentido cargarle movimientos financieros. El resto (incluso Finalizado)
        sí: una factura puede llegar tarde, o un evento cancelado puede haber
        dejado gastos ya comprometidos.
    */
    async findAllPublicados() {
        const eventos = await this.prisma.evento.findMany({
            where: { estado: { not: 'Borrador' } },
            include: { jornadas: this.jornadasOrdenadas }
        });
        return this.porFechaDeInicio(eventos.map((e) => this.resumir(e)));
    }

    /*
        Solo eventos Activos con al menos una jornada que se pueda comprar: un
        evento activo que no tiene nada para vender no se muestra al público.
    */
    async findAllActivos() {
        const vendibles = this.jornadasVendibles();
        const eventos = await this.prisma.evento.findMany({
            where: { estado: 'Activo', jornadas: { some: vendibles } },
            include: {
                imagenes: true,
                jornadas: { where: vendibles, ...this.jornadasOrdenadas }
            }
        });
        return this.porFechaDeInicio(eventos.map((e) => this.resumir(e)));
    }

    async findOne(id: number) {
        const evento = await this.prisma.evento.findUnique({
            where: { id },
            include: { jornadas: this.jornadasOrdenadas }
        });
        return evento ? this.resumir(evento) : null;
    }

    /*
        El detalle muestra todas las jornadas activas que todavía no empezaron.
        Las que no tienen nada para vender online (lotes agotados, o la venta
        online ya cerró por estar cerca del inicio) llegan con entradas vacías
        y la pantalla las muestra como "Agotada". El evento se muestra solo si
        al menos una jornada se puede comprar.
    */
    async findOneEventoPublico(id: number) {
        const evento = await this.prisma.evento.findFirst({
            where: { id, estado: 'Activo', jornadas: { some: this.jornadasVendibles() } },
            include: {
                imagenes: true,
                jornadas: {
                    where: { estado: 'Activo', fechaHoraInicio: { gt: new Date() } },
                    ...this.jornadasOrdenadas,
                    include: {
                        entradas: {
                            /*
                                Un lote sin tickets a la venta está agotado y no se ofrece.
                                Una reserva vencida cuenta como libre: se libera recién
                                cuando alguien compra (ver liberarReservasVencidas).
                            */
                            where: {
                                estado: 'Disponible', habilitada: true, esFisica: false,
                                tickets: { some: { OR: [
                                    { estado: 'Disponible' },
                                    { estado: 'Reservado', orden: { expiraEn: { lte: new Date() } } },
                                ] } },
                            },
                            select: { id: true, descripcion: true, precio: true },
                            orderBy: { precio: 'asc' }
                        }
                    }
                }
            }
        });

        if (!evento) {
            throw new NotFoundException('El evento no existe o no esta activo');
        }
        // Con la venta online cerrada sus lotes no se ofrecen, aunque les queden tickets
        const limite = limiteVentaOnline();
        const jornadas = evento.jornadas.map((jornada) => {
            const ventaOnlineAbierta = jornada.fechaHoraInicio > limite;
            return { ...jornada, ventaOnlineAbierta, entradas: ventaOnlineAbierta ? jornada.entradas : [] };
        });
        return this.resumir({ ...evento, jornadas });
    }

    // Crea el evento y todas sus jornadas en una sola operación: se guarda todo o nada
    createEvento(data: CreateEventoDto) {
        const { jornadas, ...evento } = data;

        // Fin posterior al inicio, inicio futuro y sin superposición entre las jornadas del evento
        this.jornada.validarFechasNuevas(jornadas);

        return this.prisma.evento.create({
            data: { ...evento, jornadas: { create: jornadas } },
            include: { jornadas: this.jornadasOrdenadas }
        });
    }

    async updateEvento(id: number, data: UpdateEventoDto) {
        const evento = await this.findOne(id);
        if (!evento) {
            throw new NotFoundException('No existe el evento que intentas editar');
        }
        // Un evento finalizado es historia: no se puede reescribir lo que ya pasó.
        if (evento.estado === 'Finalizado') {
            throw new ConflictException('No se puede modificar un evento finalizado');
        }

        return this.prisma.evento.update({ where: { id }, data });
    }

    async removeEvento(id: number) {
        const evento = await this.findOne(id);
        if (!evento) {
            throw new NotFoundException('No existe el evento que intentas eliminar');
        }

        if (evento.jornadas.some((j) => j.estado !== 'Borrador')) {
            throw new ConflictException('No puedes eliminar eventos que tengan jornadas publicadas o finalizadas');
        }

        const movimientos = await this.prisma.movimientoFinanciero.count({ where: { idEvento: id } });
        if (movimientos > 0) {
            throw new ConflictException('No se puede eliminar: el evento tiene movimientos financieros registrados');
        }
        /*
            Si todas las jornadas siguen en Borrador, ninguna estuvo Activa, así
            que ninguna de sus entradas pudo publicarse ni tener tickets o
            ventas reales: son seguras de borrar en cascada junto con el evento.
        */
        const imagenes = await this.imagenEventoService.findAllByEvento(id);
        for (const imagen of imagenes) {
            await this.imagenEventoService.remove(imagen.id);
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({ where: { jornada: { idEvento: id } } });
            await tx.jornada.deleteMany({ where: { idEvento: id } });
            return tx.evento.delete({ where: { id } });
        });
    }

    private async obtenerEvento(id: number) {
        const evento = await this.findOne(id);
        if (!evento) {
            throw new NotFoundException('No existe el evento');
        }
        return evento;
    }

    // Qué le falta a cada jornada en Borrador para publicarse (la pantalla lo muestra antes de confirmar)
    async revisarPublicacion(id: number) {
        await this.obtenerEvento(id);
        return this.jornada.revisarPublicacion(id);
    }

    /*
        Publica en un solo paso: si el evento está en Borrador lo activa, y
        publica todas sus jornadas COMPLETAS. Con el evento ya Activo sirve
        para publicar las jornadas que se completaron (o agregaron) después.

        Las incompletas quedan en Borrador. Como eso puede no ser lo que el
        usuario espera, si hay alguna se exige que lo confirme
        (confirmarIncompletas); si no, se rechaza sin tocar nada.
    */
    async publicar(id: number, confirmarIncompletas = false) {
        const evento = await this.obtenerEvento(id);

        if (evento.estado !== 'Borrador' && evento.estado !== 'Activo') {
            throw new ConflictException('Solo se pueden publicar eventos en Borrador o Activos');
        }
        const imagenes = await this.imagenEventoService.findAllByEvento(id);
        if (imagenes.length === 0) {
            throw new ConflictException('No se puede publicar un evento sin una imagen publicitaria');
        }

        const revision = await this.jornada.revisarPublicacion(id);
        const completas = revision.filter((r) => r.faltantes.length === 0);
        const incompletas = revision.length - completas.length;

        if (revision.length === 0) {
            throw new ConflictException('El evento no tiene jornadas en borrador para publicar');
        }
        // Un evento activo sin nada para vender no tiene sentido: hace falta al menos una completa
        if (completas.length === 0) {
            throw new ConflictException('Ninguna jornada está completa para publicarse: revisá lo que le falta a cada una');
        }
        if (incompletas > 0 && !confirmarIncompletas) {
            throw new ConflictException(`${incompletas} jornada(s) no están completas y quedarían sin publicar. Confirmá para publicar solo las completas`);
        }

        // Todo o nada: si falla una jornada, ni el evento ni las demás quedan publicados a medias
        await this.prisma.$transaction(async (tx) => {
            if (evento.estado === 'Borrador') {
                await tx.evento.update({ where: { id }, data: { estado: 'Activo' } });
            }
            for (const jornada of completas) {
                await this.jornada.publicarEnTransaccion(tx, jornada.id);
            }
        });
        return this.obtenerEvento(id);
    }

    /*
        Suspende todas las jornadas Activas de una vez. El evento sigue Activo:
        suspender no lo cierra, y cada jornada se puede reprogramar por separado.
    */
    async suspender(id: number) {
        const evento = await this.obtenerEvento(id);

        if (evento.estado !== 'Activo') {
            throw new ConflictException('Solo se pueden suspender las jornadas de un evento Activo');
        }
        const suspendidas = await this.prisma.jornada.updateMany({
            where: { idEvento: id, estado: 'Activo' },
            data: { estado: 'Suspendido' }
        });
        if (suspendidas.count === 0) {
            throw new ConflictException('El evento no tiene jornadas activas para suspender');
        }

        return this.obtenerEvento(id);
    }

    /*
        Cierra el evento: nada puede quedar en curso. Las jornadas Activas o
        Suspendidas se resuelven antes, una por una, porque cada una tiene su
        propio cierre (finalizar o cancelar).
    */
    async finalizar(id: number, descartarBorradores = false) {
        const evento = await this.obtenerEvento(id);

        if (evento.estado !== 'Activo') {
            throw new ConflictException('Solo se pueden finalizar eventos que estén Activos');
        }
        const pendientes = evento.jornadas.filter((j) => j.estado === 'Activo' || j.estado === 'Suspendido');
        if (pendientes.length > 0) {
            throw new ConflictException('El evento todavía tiene jornadas activas o suspendidas: finalizalas o cancelalas primero');
        }
        const cerradas = evento.jornadas.filter((j) => j.estado === 'Finalizado' || j.estado === 'Cancelado');
        if (cerradas.length === 0) {
            throw new ConflictException('El evento no tuvo ninguna jornada: si no se va a realizar, eliminalo');
        }
        await this.validarRendicionesCompletas(id);

        await this.prisma.$transaction(async (tx) => {
            await this.resolverBorradores(tx, id, descartarBorradores);
            await tx.evento.update({ where: { id }, data: { estado: 'Finalizado' } });
        });
        return this.obtenerEvento(id);
    }

    /*
        Finalizar es "el evento está cerrado": ningún local puede seguir con
        tickets sin rendir. Las deudas de plata no frenan el cierre: se siguen
        cobrando con rendiciones de solo pago.
        Cancelar, en cambio, no se bloquea: es una urgencia, y los locales
        rinden después.
    */
    private async validarRendicionesCompletas(idEvento: number) {
        const pendientes = await this.prisma.ticketEvento.groupBy({
            by: ['idPuntoVenta'],
            where: ticketsSinRendir(idEvento),
            _count: true,
        });
        if (pendientes.length === 0) return;

        const puntos = await this.prisma.puntoVenta.findMany({
            where: { id: { in: pendientes.map((p) => p.idPuntoVenta as number) } },
            select: { id: true, nombre: true },
        });
        const detalle = pendientes
            .map((p) => `${puntos.find((punto) => punto.id === p.idPuntoVenta)?.nombre} (${p._count})`)
            .join(', ');
        throw new ConflictException(
            `Hay tickets asignados a puntos de venta sin rendir: ${detalle}. Registrá sus rendiciones antes de finalizar el evento`,
        );
    }

    /*
        Cancela el evento completo: todas las jornadas Activas o Suspendidas
        pasan a Cancelado y el evento queda Finalizado. El estado Cancelado
        queda solo en cada jornada.
    */
    async cancelar(id: number, descartarBorradores = false) {
        const evento = await this.obtenerEvento(id);

        if (evento.estado !== 'Activo') {
            throw new ConflictException('Solo se pueden cancelar eventos que estén Activos');
        }
        const idsACancelar = evento.jornadas
            .filter((j) => j.estado === 'Activo' || j.estado === 'Suspendido')
            .map((j) => j.id);
        if (idsACancelar.length === 0) {
            throw new ConflictException('El evento no tiene jornadas para cancelar: si ya terminó, finalizalo');
        }

        await this.prisma.$transaction(async (tx) => {
            await this.resolverBorradores(tx, id, descartarBorradores);
            // Mismo criterio que cancelar una jornada (ver JornadasService.cancelar)
            await tx.entrada.deleteMany({
                where: { idJornada: { in: idsACancelar }, estado: 'Borrador', tickets: { none: {} } }
            });
            await anularTicketsSinVender(tx, idsACancelar);
            await tx.jornada.updateMany({ where: { id: { in: idsACancelar } }, data: { estado: 'Cancelado' } });
            await tx.evento.update({ where: { id }, data: { estado: 'Finalizado' } });
        });
        return this.obtenerEvento(id);
    }

    /*
        Las jornadas en Borrador nunca se publicaron, así que no quedan en un
        evento cerrado. Borrarlas es irreversible: si el cliente no lo pidió
        de forma explícita, se corta todo antes de tocar nada.
    */
    private async resolverBorradores(tx: Prisma.TransactionClient, idEvento: number, descartar: boolean) {
        const borradores = await tx.jornada.count({ where: { idEvento, estado: 'Borrador' } });
        if (borradores === 0) return;

        if (!descartar) {
            throw new ConflictException(`El evento tiene ${borradores} jornada(s) en borrador que se descartarían. Confirmá que querés descartarlas`);
        }
        // Como en JornadasService.remove: una jornada en Borrador nunca estuvo Activa, sus entradas son seguras de borrar
        await tx.entrada.deleteMany({ where: { jornada: { idEvento, estado: 'Borrador' } } });
        await tx.jornada.deleteMany({ where: { idEvento, estado: 'Borrador' } });
    }
}
