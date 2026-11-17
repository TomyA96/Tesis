import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoEvento, EstadoTicket, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const { Decimal } = Prisma;
const CERO = new Decimal(0);
const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

// El año de un evento es el de su primera jornada, en hora argentina (una jornada del 31/12 a las 22 hs es del año que termina)
const formatoAnio = new Intl.DateTimeFormat('es-AR', { timeZone: ZONA_ARGENTINA, year: 'numeric' });
const anioDe = (fecha: Date) => Number(formatoAnio.format(fecha));
// La hora (0 a 23) en Argentina, para agrupar las ventas del buffet por franja
const formatoHora = new Intl.DateTimeFormat('es-AR', { timeZone: ZONA_ARGENTINA, hour: 'numeric', hourCycle: 'h23' });
const horaDe = (fecha: Date) => Number(formatoHora.format(fecha));

// Un ticket Usado también se vendió: pasó por el control de acceso
const VENDIDOS: EstadoTicket[] = ['Vendido', 'Usado'];

/*
    Un ticket cuenta como vendido (y su precio como recaudado) solo si está
    Vendido o Usado Y tiene la plata registrada: online (con orden), venta en
    puerta (con vendedor) o de un local que ya lo incluyó en una rendición. Un
    ticket físico puede estar Usado sin haberse cobrado (el portero deja pasar
    a quien tiene el papel), así que el estado solo no alcanza. Es la misma
    regla en el resumen anual y en el informe de cada evento.
*/
const TICKET_VENDIDO: Prisma.TicketEventoWhereInput = {
    estado: { in: VENDIDOS },
    OR: [
        { idOrden: { not: null } },
        { idRendicion: { not: null } },
        { idVendedor: { not: null }, idPuntoVenta: null },
    ],
};

/*
    Pendiente de rendir: la misma condición que ticketsSinRendir
    (entradas/utils/tickets.ts), pero sin atarla a un evento. Los Asignado
    pueden volver sin venderse, así que su monto es lo máximo que podría
    entrar, no lo vendido.
*/
const PENDIENTE_DE_RENDIR: Prisma.TicketEventoWhereInput = {
    idPuntoVenta: { not: null },
    idRendicion: null,
    estado: { in: ['Asignado', 'Usado'] },
};

/*
    Una jornada realizada es la que ya se hizo: cerrada (Finalizado), o activa
    con la fecha de fin ya pasada. Las canceladas y suspendidas no cuentan.
    Solo esas entran en la ocupación: una que todavía no ocurrió daría 0%.
*/
const estaRealizada = (j: { estado: EstadoEvento; fechaHoraFin: Date }, ahora: Date) =>
    j.estado === 'Finalizado' || (j.estado === 'Activo' && j.fechaHoraFin <= ahora);

// La respuesta va en números (no Decimal) para que el frontend arme los gráficos directo
const plata = (monto: Prisma.Decimal) => monto.toDecimalPlaces(2).toNumber();
// Con un decimal; null cuando no hay sobre qué calcularlo (capacidad o recaudación en cero)
const porcentaje = (parte: number, total: number) => (total === 0 ? null : Math.round((parte / total) * 1000) / 10);

type Acumulado = {
    entradasVendidas: number;
    entradas: Prisma.Decimal;
    buffet: Prisma.Decimal;
    otrosIngresos: Prisma.Decimal;
    gastos: Prisma.Decimal;
    comisiones: Prisma.Decimal;
};

@Injectable()
export class InformesService {
    constructor(private prisma: PrismaService) {}

    /*
        Los eventos publicados (todo menos Borrador, cancelados incluidos: pueden
        haber tenido gastos), con sus fechas y el año al que pertenecen. Las
        fechas salen de las jornadas publicadas; las que quedaron en Borrador
        nunca existieron para el público.
    */
    private async eventosPublicados() {
        const eventos = await this.prisma.evento.findMany({
            where: { estado: { not: 'Borrador' } },
            select: {
                id: true,
                nombre: true,
                estado: true,
                jornadas: {
                    select: { id: true, nombre: true, fechaHoraInicio: true, fechaHoraFin: true, capacidad: true, estado: true },
                    orderBy: { fechaHoraInicio: 'asc' },
                },
            },
        });

        return eventos.flatMap((evento) => {
            const publicadas = evento.jornadas.filter((j) => j.estado !== 'Borrador');
            const jornadas = publicadas.length > 0 ? publicadas : evento.jornadas;
            if (jornadas.length === 0) return [];

            const inicio = jornadas[0].fechaHoraInicio;
            const fin = new Date(Math.max(...jornadas.map((j) => j.fechaHoraFin.getTime())));
            return [{
                ...evento,
                jornadas,
                // Todas, también las borrador: la venta de buffet o los accesos se buscan por jornada
                idsJornadas: evento.jornadas.map((j) => j.id),
                inicio,
                fin,
                anio: anioDe(inicio),
            }];
        });
    }

    // Los años que tienen al menos un evento publicado, del más nuevo al más viejo
    async aniosConEventos() {
        const eventos = await this.eventosPublicados();
        return [...new Set(eventos.map((e) => e.anio))].sort((a, b) => b - a);
    }

    /*
        Resumen de todos los eventos publicados del año. De dónde sale cada número:
        - Entradas: los tickets vendidos (Vendido o Usado), contando solo los que
          tienen la plata registrada: online (con orden), venta en puerta (con
          vendedor) y los de los locales que ya entraron en una rendición. Un
          ticket físico puede estar Usado sin haberse cobrado (el portero deja
          pasar a quien tiene el papel), así que el estado solo no alcanza.
        - Buffet: las ventas del buffet de las jornadas del evento.
        - Otros ingresos y gastos: los movimientos financieros (subsidios,
          publicidad, proveedores). Las ventas nunca se cargan ahí.
        - Comisiones: lo que se quedaron los locales, según sus rendiciones. Va
          como gasto.
    */
    async resumenAnual(anio: number) {
        const eventos = (await this.eventosPublicados())
            .filter((e) => e.anio === anio)
            .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
        const ids = eventos.map((e) => e.id);
        const delAnio = { entrada: { jornada: { idEvento: { in: ids } } } };

        const [entradas, vendidos, sinRendir, conAcceso, buffet, comisiones, movimientos] = await Promise.all([
            this.prisma.entrada.findMany({
                where: { jornada: { idEvento: { in: ids } } },
                select: { id: true, idJornada: true, jornada: { select: { idEvento: true } } },
            }),
            this.prisma.ticketEvento.groupBy({
                by: ['idEntrada'],
                where: { ...delAnio, ...TICKET_VENDIDO },
                _count: true,
                _sum: { precio: true },
            }),
            this.prisma.ticketEvento.groupBy({
                by: ['idEntrada'],
                where: { ...delAnio, ...PENDIENTE_DE_RENDIR },
                _count: true,
                _sum: { precio: true },
            }),
            this.prisma.ticketEvento.groupBy({
                by: ['idEntrada'],
                where: { ...delAnio, accesos: { isNot: null } },
                _count: true,
            }),
            // Las ventas anuladas (errores de la caja) no cuentan
            this.prisma.ventaBuffet.groupBy({
                by: ['idJornada'],
                where: { jornada: { idEvento: { in: ids } }, estado: 'Registrada' },
                _sum: { total: true },
            }),
            this.prisma.rendicion.groupBy({
                by: ['idEvento'],
                where: { idEvento: { in: ids } },
                _sum: { montoComision: true },
            }),
            this.prisma.movimientoFinanciero.groupBy({
                by: ['idEvento', 'tipoMovimiento'],
                where: { idEvento: { in: ids } },
                _sum: { monto: true },
            }),
        ]);

        // Los tickets se agrupan por lote y el buffet por jornada: con esto se sabe de qué evento es cada uno
        const eventoDeEntrada = new Map(entradas.map((e) => [e.id, e.jornada.idEvento]));
        const jornadaDeEntrada = new Map(entradas.map((e) => [e.id, e.idJornada]));
        const eventoDeJornada = new Map(eventos.flatMap((e) => e.idsJornadas.map((id) => [id, e.id] as const)));

        const acumulado = new Map<number, Acumulado>(
            eventos.map((e) => [e.id, { entradasVendidas: 0, entradas: CERO, buffet: CERO, otrosIngresos: CERO, gastos: CERO, comisiones: CERO }]),
        );
        const sumarA = (idEvento: number | undefined, sumar: (a: Acumulado) => void) => {
            const a = idEvento === undefined ? undefined : acumulado.get(idEvento);
            if (a) sumar(a);
        };

        for (const g of vendidos) {
            sumarA(eventoDeEntrada.get(g.idEntrada), (a) => {
                a.entradasVendidas += g._count;
                a.entradas = a.entradas.add(g._sum.precio ?? CERO);
            });
        }
        for (const g of buffet) {
            sumarA(eventoDeJornada.get(g.idJornada), (a) => (a.buffet = a.buffet.add(g._sum.total ?? CERO)));
        }
        for (const g of comisiones) {
            sumarA(g.idEvento, (a) => (a.comisiones = a.comisiones.add(g._sum.montoComision ?? CERO)));
        }
        for (const g of movimientos) {
            sumarA(g.idEvento, (a) => {
                const monto = g._sum.monto ?? CERO;
                if (g.tipoMovimiento === 'Ingreso') a.otrosIngresos = a.otrosIngresos.add(monto);
                else a.gastos = a.gastos.add(monto);
            });
        }

        const asistentesDeJornada = new Map<number, number>();
        for (const g of conAcceso) {
            const idJornada = jornadaDeEntrada.get(g.idEntrada);
            if (idJornada !== undefined) asistentesDeJornada.set(idJornada, (asistentesDeJornada.get(idJornada) ?? 0) + g._count);
        }

        // La ocupación es solo de las jornadas realizadas (ver estaRealizada)
        const ahora = new Date();
        const filas = eventos.map((evento) => {
            const a = acumulado.get(evento.id)!;
            const recaudado = a.entradas.add(a.buffet).add(a.otrosIngresos);
            const gastado = a.gastos.add(a.comisiones);

            const realizadas = evento.jornadas
                .filter((j) => estaRealizada(j, ahora))
                .map((j) => {
                    const asistentes = asistentesDeJornada.get(j.id) ?? 0;
                    return {
                        id: j.id,
                        nombre: j.nombre,
                        fechaHoraInicio: j.fechaHoraInicio,
                        asistentes,
                        capacidad: j.capacidad,
                        porcentaje: porcentaje(asistentes, j.capacidad),
                    };
                });
            // Total de asistentes sobre total de capacidad, no el promedio de los porcentajes: así pesa más la jornada más grande
            const asistentesRealizadas = realizadas.reduce((suma, j) => suma + j.asistentes, 0);
            const capacidadRealizadas = realizadas.reduce((suma, j) => suma + j.capacidad, 0);

            return {
                id: evento.id,
                nombre: evento.nombre,
                estado: evento.estado,
                fechaInicio: evento.inicio,
                fechaFin: evento.fin,
                entradasVendidas: a.entradasVendidas,
                asistentes: evento.idsJornadas.reduce((suma, id) => suma + (asistentesDeJornada.get(id) ?? 0), 0),
                recaudadoEntradas: plata(a.entradas),
                recaudadoBuffet: plata(a.buffet),
                otrosIngresos: plata(a.otrosIngresos),
                gastos: plata(a.gastos),
                comisiones: plata(a.comisiones),
                recaudado: plata(recaudado),
                gastado: plata(gastado),
                ganancia: plata(recaudado.sub(gastado)),
                ocupacion: {
                    asistentes: asistentesRealizadas,
                    capacidad: capacidadRealizadas,
                    porcentaje: porcentaje(asistentesRealizadas, capacidadRealizadas),
                    jornadas: realizadas,
                },
            };
        });

        /*
            Contribución a la ganancia: los que ganaron, sobre el total ganado; los
            que perdieron, en negativo, sobre el total perdido. Así ninguno pasa del
            100% y no se divide por una ganancia total negativa o en cero.
        */
        const totalGanado = filas.reduce((suma, f) => suma + Math.max(f.ganancia, 0), 0);
        const totalPerdido = filas.reduce((suma, f) => suma + Math.max(-f.ganancia, 0), 0);
        const eventosConContribucion = filas.map((f) => ({
            ...f,
            contribucion:
                f.ganancia > 0 ? porcentaje(f.ganancia, totalGanado)! : f.ganancia < 0 ? -porcentaje(-f.ganancia, totalPerdido)! : 0,
        }));

        const sumar = (campo: (a: Acumulado) => Prisma.Decimal) =>
            [...acumulado.values()].reduce((suma, a) => suma.add(campo(a)), CERO);
        const entradasTotal = sumar((a) => a.entradas);
        const buffetTotal = sumar((a) => a.buffet);
        const otrosTotal = sumar((a) => a.otrosIngresos);
        const gastosTotal = sumar((a) => a.gastos);
        const comisionesTotal = sumar((a) => a.comisiones);
        const recaudado = entradasTotal.add(buffetTotal).add(otrosTotal);
        const gastado = gastosTotal.add(comisionesTotal);
        const ganancia = recaudado.sub(gastado);

        return {
            anio,
            totales: {
                recaudado: plata(recaudado),
                entradas: plata(entradasTotal),
                buffet: plata(buffetTotal),
                otrosIngresos: plata(otrosTotal),
                gastado: plata(gastado),
                gastos: plata(gastosTotal),
                comisiones: plata(comisionesTotal),
                ganancia: plata(ganancia),
                // Ganancia sobre lo recaudado: lo que queda de cada peso que entró
                margen: porcentaje(ganancia.toNumber(), recaudado.toNumber()),
                pendienteRendir: {
                    tickets: sinRendir.reduce((suma, g) => suma + g._count, 0),
                    monto: plata(sinRendir.reduce((suma, g) => suma.add(g._sum.precio ?? CERO), CERO)),
                },
            },
            eventos: eventosConContribucion,
        };
    }

    /*
        Informe de un evento publicado. Entradas, accesos y buffet vienen
        separados por jornada (así el frontend filtra sin volver a pedir nada);
        finanzas es del evento completo, porque los gastos, los otros ingresos
        y las rendiciones se cargan por evento y no por jornada. Los números
        salen con las mismas reglas que el resumen anual.
    */
    async informeEvento(idEvento: number) {
        const evento = await this.prisma.evento.findUnique({
            where: { id: idEvento },
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                estado: true,
                jornadas: {
                    select: { id: true, nombre: true, fechaHoraInicio: true, fechaHoraFin: true, direccion: true, capacidad: true, estado: true },
                    orderBy: { fechaHoraInicio: 'asc' },
                },
            },
        });
        // Un evento en Borrador nunca se publicó: no tiene nada que informar
        if (!evento || evento.estado === 'Borrador') {
            throw new NotFoundException('No existe un evento publicado con ese id');
        }
        const publicadas = evento.jornadas.filter((j) => j.estado !== 'Borrador');
        const jornadas = publicadas.length > 0 ? publicadas : evento.jornadas;
        const delEvento = { entrada: { jornada: { idEvento } } };

        const [lotes, vendidos, emitidosPorLote, accesosPorLote, sinRendir, ventasBuffet, movimientos, comisionesPorLocal] = await Promise.all([
            this.prisma.entrada.findMany({
                where: { jornada: { idEvento } },
                select: { id: true, idJornada: true, descripcion: true, esFisica: true, precio: true },
                orderBy: { id: 'asc' },
            }),
            // Uno por uno (no agrupados): de cada vendido hace falta saber por qué canal se vendió
            this.prisma.ticketEvento.findMany({
                where: { ...delEvento, ...TICKET_VENDIDO },
                select: {
                    idEntrada: true,
                    estado: true,
                    precio: true,
                    idOrden: true,
                    idRendicion: true,
                    puntoVenta: { select: { id: true, nombre: true } },
                },
            }),
            this.prisma.ticketEvento.groupBy({ by: ['idEntrada'], where: delEvento, _count: true }),
            this.prisma.ticketEvento.groupBy({ by: ['idEntrada'], where: { ...delEvento, accesos: { isNot: null } }, _count: true }),
            this.prisma.ticketEvento.groupBy({
                by: ['idEntrada'],
                where: { ...delEvento, ...PENDIENTE_DE_RENDIR },
                _count: true,
                _sum: { precio: true },
            }),
            this.prisma.ventaBuffet.findMany({
                where: { jornada: { idEvento }, estado: 'Registrada' },
                select: {
                    idJornada: true,
                    fechaHora: true,
                    total: true,
                    detalleVenta: { select: { cantidad: true, subtotal: true, producto: { select: { id: true, nombre: true, tipo: true } } } },
                },
            }),
            this.prisma.movimientoFinanciero.findMany({
                where: { idEvento },
                select: {
                    id: true,
                    tipoMovimiento: true,
                    fecha: true,
                    monto: true,
                    descripcion: true,
                    nroFactura: true,
                    rubro: { select: { nombre: true } },
                    proveedor: { select: { nombre: true } },
                    fuente: { select: { nombre: true } },
                },
                orderBy: { fecha: 'asc' },
            }),
            this.prisma.rendicion.groupBy({ by: ['idPuntoVenta'], where: { idEvento }, _sum: { montoComision: true } }),
        ]);

        const contar = (grupos: { idEntrada: number; _count: number }[], idEntrada: number) =>
            grupos.find((g) => g.idEntrada === idEntrada)?._count ?? 0;
        const sumarPrecios = (tickets: { precio: Prisma.Decimal }[]) => tickets.reduce((suma, t) => suma.add(t.precio), CERO);
        const ahora = new Date();

        const porJornada = jornadas.map((jornada) => {
            const lotesDeJornada = lotes.filter((l) => l.idJornada === jornada.id);
            const idsLotes = new Set(lotesDeJornada.map((l) => l.id));
            const vendidosDeJornada = vendidos.filter((t) => idsLotes.has(t.idEntrada));
            const asistentes = lotesDeJornada.reduce((suma, l) => suma + contar(accesosPorLote, l.id), 0);
            const pendientes = sinRendir.filter((g) => idsLotes.has(g.idEntrada));

            // Canal de cada venta: online (con orden), el local que la rindió, o la puerta
            const canales = new Map<string, { canal: string; tipo: 'Online' | 'Local' | 'Puerta'; cantidad: number; monto: Prisma.Decimal }>();
            for (const t of vendidosDeJornada) {
                const [clave, canal, tipo] =
                    t.idOrden !== null
                        ? ['online', 'Online', 'Online' as const]
                        : t.idRendicion !== null && t.puntoVenta
                          ? [`local-${t.puntoVenta.id}`, t.puntoVenta.nombre, 'Local' as const]
                          : ['puerta', 'Venta en puerta', 'Puerta' as const];
                const actual = canales.get(clave) ?? { canal, tipo, cantidad: 0, monto: CERO };
                canales.set(clave, { ...actual, cantidad: actual.cantidad + 1, monto: actual.monto.add(t.precio) });
            }

            // Buffet: por producto y por hora (en hora argentina), separando comida de bebida
            const ventasDeJornada = ventasBuffet.filter((v) => v.idJornada === jornada.id);
            const productos = new Map<number, { id: number; nombre: string; tipo: string; cantidad: number; total: Prisma.Decimal }>();
            const porHora = new Map<number, { hora: number; comida: Prisma.Decimal; bebida: Prisma.Decimal }>();
            for (const venta of ventasDeJornada) {
                const hora = horaDe(venta.fechaHora);
                const franja = porHora.get(hora) ?? { hora, comida: CERO, bebida: CERO };
                for (const d of venta.detalleVenta) {
                    const p = productos.get(d.producto.id) ?? { ...d.producto, cantidad: 0, total: CERO };
                    productos.set(d.producto.id, { ...p, cantidad: p.cantidad + d.cantidad, total: p.total.add(d.subtotal) });
                    if (d.producto.tipo === 'Comida') franja.comida = franja.comida.add(d.subtotal);
                    else franja.bebida = franja.bebida.add(d.subtotal);
                }
                porHora.set(hora, franja);
            }

            return {
                id: jornada.id,
                nombre: jornada.nombre,
                fechaHoraInicio: jornada.fechaHoraInicio,
                fechaHoraFin: jornada.fechaHoraFin,
                direccion: jornada.direccion,
                capacidad: jornada.capacidad,
                estado: jornada.estado,
                realizada: estaRealizada(jornada, ahora),
                entradas: {
                    emitidas: lotesDeJornada.reduce((suma, l) => suma + contar(emitidosPorLote, l.id), 0),
                    vendidas: vendidosDeJornada.length,
                    // Vendidas que todavía no pasaron por el control de acceso (las Usado ya ingresaron)
                    vendidasSinUsar: vendidosDeJornada.filter((t) => t.estado === 'Vendido').length,
                    asistentes,
                    recaudado: plata(sumarPrecios(vendidosDeJornada)),
                    canales: [...canales.values()].map((c) => ({ ...c, monto: plata(c.monto) })),
                    // Solo los lotes que llegaron a tener tickets (publicados o impresos)
                    lotes: lotesDeJornada
                        .map((l) => {
                            const delLote = vendidosDeJornada.filter((t) => t.idEntrada === l.id);
                            return {
                                id: l.id,
                                descripcion: l.descripcion,
                                esFisica: l.esFisica,
                                precio: plata(l.precio),
                                emitidas: contar(emitidosPorLote, l.id),
                                vendidas: delLote.length,
                                recaudado: plata(sumarPrecios(delLote)),
                            };
                        })
                        .filter((l) => l.emitidas > 0),
                    pendienteRendir: {
                        tickets: pendientes.reduce((suma, g) => suma + g._count, 0),
                        monto: plata(pendientes.reduce((suma, g) => suma.add(g._sum.precio ?? CERO), CERO)),
                    },
                },
                buffet: {
                    ventas: ventasDeJornada.length,
                    total: plata(ventasDeJornada.reduce((suma, v) => suma.add(v.total), CERO)),
                    productos: [...productos.values()].map((p) => ({ ...p, total: plata(p.total) })),
                    porHora: [...porHora.values()].map((f) => ({ hora: f.hora, comida: plata(f.comida), bebida: plata(f.bebida) })),
                },
            };
        });

        // Finanzas: del evento completo
        const entradas = sumarPrecios(vendidos);
        const buffet = ventasBuffet.reduce((suma, v) => suma.add(v.total), CERO);
        const ingresos = movimientos.filter((m) => m.tipoMovimiento === 'Ingreso');
        const gastos = movimientos.filter((m) => m.tipoMovimiento === 'Gasto');
        const otrosIngresos = ingresos.reduce((suma, m) => suma.add(m.monto), CERO);
        const totalGastos = gastos.reduce((suma, m) => suma.add(m.monto), CERO);
        const puntosVenta = await this.prisma.puntoVenta.findMany({
            where: { id: { in: comisionesPorLocal.map((c) => c.idPuntoVenta) } },
            select: { id: true, nombre: true },
        });
        const comisiones = comisionesPorLocal
            .map((c) => ({
                idPuntoVenta: c.idPuntoVenta,
                puntoVenta: puntosVenta.find((p) => p.id === c.idPuntoVenta)?.nombre ?? '',
                monto: plata(c._sum.montoComision ?? CERO),
            }))
            .filter((c) => c.monto > 0);
        const totalComisiones = comisionesPorLocal.reduce((suma, c) => suma.add(c._sum.montoComision ?? CERO), CERO);
        const recaudado = entradas.add(buffet).add(otrosIngresos);
        const gastado = totalGastos.add(totalComisiones);
        const ganancia = recaudado.sub(gastado);

        const movimiento = (m: (typeof movimientos)[number]) => ({
            id: m.id,
            fecha: m.fecha,
            rubro: m.rubro.nombre,
            // De quién vino el ingreso (fuente) o a quién se le pagó el gasto (proveedor)
            origen: m.fuente?.nombre ?? m.proveedor?.nombre ?? null,
            descripcion: m.descripcion,
            nroFactura: m.nroFactura,
            monto: plata(m.monto),
        });

        return {
            evento: {
                id: evento.id,
                nombre: evento.nombre,
                descripcion: evento.descripcion,
                estado: evento.estado,
                fechaInicio: jornadas[0]?.fechaHoraInicio ?? null,
                fechaFin: jornadas.length > 0 ? new Date(Math.max(...jornadas.map((j) => j.fechaHoraFin.getTime()))) : null,
                // Los lugares distintos (un festival puede tener jornadas en sitios diferentes)
                direcciones: [...new Set(jornadas.map((j) => j.direccion))],
                // Capacidad de lo que se iba a hacer: una jornada cancelada no suma lugares
                capacidad: jornadas.filter((j) => j.estado !== 'Cancelado').reduce((suma, j) => suma + j.capacidad, 0),
            },
            jornadas: porJornada,
            finanzas: {
                entradas: plata(entradas),
                buffet: plata(buffet),
                otrosIngresos: plata(otrosIngresos),
                recaudado: plata(recaudado),
                gastos: plata(totalGastos),
                comisiones: plata(totalComisiones),
                gastado: plata(gastado),
                ganancia: plata(ganancia),
                margen: porcentaje(ganancia.toNumber(), recaudado.toNumber()),
                ingresos: ingresos.map(movimiento),
                gastosDetalle: gastos.map(movimiento),
                comisionesPorLocal: comisiones,
            },
        };
    }
}
