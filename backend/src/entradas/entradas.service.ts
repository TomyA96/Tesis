import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntradaDto } from './dtos/create.entrada.dto';
import { CreateEntradasLoteDto } from './dtos/create.entradas-lote.dto';
import { UpdateEntradaDto } from './dtos/update.entrada.dto';
import { ConfigurarBoleteriaDto } from './dtos/configurar-boleteria.dto';
import { armarTicketsDelLote, liberarReservasVencidas, lugaresOcupados, publicarLoteOnline } from './utils/tickets';
import { pdfDeTickets } from './utils/pdf-tickets';
import { NOMBRE_BOLETERIA, esNombreReservado } from './utils/boleteria';
import { mismoNombre } from '../utils/texto';

const JORNADA_SUSPENDIDA = 'La jornada está suspendida: reprogramala para cargar entradas';

// La boletería tiene su propio camino: se configura desde el evento y se vende en la puerta
const SOLO_DESDE_BOLETERIA = 'La boletería no se maneja como un lote: se configura desde «Configurar boletería» en el evento';


@Injectable()
export class EntradasService {
    constructor(private prisma: PrismaService) {}

    /*
        Se puede listar por jornada o por evento (todas las entradas de todas
        sus jornadas). Cada lote viene con cuántos de sus tickets se vendieron
        y cuántos se anularon: se cuentan en la base, agrupados por estado.
    */
    async findAll(filtro: { idJornada?: number; idEvento?: number }) {
        const entradas = await this.prisma.entrada.findMany({
            where: {
                idJornada: filtro.idJornada,
                jornada: filtro.idEvento ? { idEvento: filtro.idEvento } : undefined,
            },
            include: {
                jornada: { select: { id: true, nombre: true, fechaHoraInicio: true } },
            },
            orderBy: [{ jornada: { fechaHoraInicio: 'asc' } }, { id: 'asc' }],
        });

        const porEstado = await this.prisma.ticketEvento.groupBy({
            by: ['idEntrada', 'estado'],
            where: { idEntrada: { in: entradas.map((e) => e.id) } },
            _count: true,
        });
        const contar = (idEntrada: number, estados: string[]) =>
            porEstado
                .filter((g) => g.idEntrada === idEntrada && estados.includes(g.estado))
                .reduce((suma, g) => suma + g._count, 0);

        return entradas.map((entrada) => ({
            ...entrada,
            // Usado también es vendido: el ticket ya pasó por la puerta
            vendidos: contar(entrada.id, ['Vendido', 'Usado']),
            anulados: contar(entrada.id, ['Anulado', 'Reembolsado']),
            // Solo tienen sentido en un lote físico: los que tiene el organizador y los que están en locales
            enMano: contar(entrada.id, ['Impreso']),
            enLocales: contar(entrada.id, ['Asignado']),
        }));
    }


    findOne(id: number) {
        return this.prisma.entrada.findUnique({ where: { id } });
    }

    private async obtenerEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({ where: { id }, include: { jornada: true } });
        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        return entrada;
    }

    async createEntrada(data: CreateEntradaDto) {
        const jornada = await this.prisma.jornada.findUnique({ where: { id: data.idJornada } });
        if (!jornada) {
            throw new NotFoundException('No existe la jornada a la que intentas asociar la entrada');
        }
        if (jornada.estado === "Finalizado" || jornada.estado === "Cancelado") {
            throw new ConflictException('No se puede crear una entrada para una jornada finalizada o cancelada');
        }
        // Suspendida no vende hasta que se reprograme: recién ahí, ya activa, se le cargan entradas
        if (jornada.estado === "Suspendido") {
            throw new ConflictException(JORNADA_SUSPENDIDA);
        }
        const ocupados = (await lugaresOcupados(this.prisma, [jornada.id])).get(jornada.id) ?? 0;
        if (ocupados + data.cantidad > jornada.capacidad) {
            throw new ConflictException(`La cantidad de entradas excede la capacidad de la jornada. Capacidad restante: ${jornada.capacidad - ocupados}`);
        }
        await this.validarDescripcionDisponible(data.idJornada, data.descripcion);
        return this.prisma.entrada.create({ data });
    }

    /*
        Crea el mismo lote (descripción, precio, tipo, cantidad) en cada una de
        las jornadas elegidas: un lote por jornada, no uno compartido. Revisa
        TODAS antes de crear nada y junta los problemas de cada una, así el
        usuario los ve juntos. Si alguna falla no se crea en ninguna: todo o nada.
    */
    async createLote(data: CreateEntradasLoteDto) {
        const { idsJornadas, ...entrada } = data;
        this.validarNombreNoReservado(entrada.descripcion);

        const jornadas = await this.prisma.jornada.findMany({
            where: { id: { in: idsJornadas } },
            orderBy: { fechaHoraInicio: 'asc' },
        });
        if (jornadas.length !== idsJornadas.length) {
            throw new NotFoundException('Alguna de las jornadas elegidas no existe');
        }
        // Un lote "para todas las jornadas" es de UN evento: mezclar eventos es un error del cliente
        if (new Set(jornadas.map((j) => j.idEvento)).size > 1) {
            throw new BadRequestException('Las jornadas elegidas tienen que ser del mismo evento');
        }

        // Una sola consulta para todas: qué jornadas ya tienen una entrada con ese nombre
        const lotesExistentes = await this.prisma.entrada.findMany({
            where: { idJornada: { in: idsJornadas } },
            select: { idJornada: true, descripcion: true },
        });
        const nombreOcupado = new Set(
            lotesExistentes.filter((e) => mismoNombre(e.descripcion, entrada.descripcion)).map((e) => e.idJornada),
        );

        // Cuántos lugares tiene ya comprometidos cada jornada
        const yaAsignadas = await lugaresOcupados(this.prisma, idsJornadas);

        const problemas: string[] = [];
        for (const jornada of jornadas) {
            const cual = jornada.nombre || `La jornada del ${jornada.fechaHoraInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`;

            if (jornada.estado === 'Finalizado' || jornada.estado === 'Cancelado' || jornada.estado === 'Suspendido') {
                problemas.push(`${cual}: está ${jornada.estado.toLowerCase()}`);
                continue;
            }
            if (nombreOcupado.has(jornada.id)) {
                problemas.push(`${cual}: ya tiene una entrada con ese nombre`);
            }
            const restante = jornada.capacidad - (yaAsignadas.get(jornada.id) ?? 0);
            if (entrada.cantidad > restante) {
                problemas.push(`${cual}: la cantidad supera la capacidad restante (${restante})`);
            }
        }
        if (problemas.length > 0) {
            throw new ConflictException(`No se creó el lote en ninguna jornada. ${problemas.join('. ')}`);
        }

        return this.prisma.$transaction(
            jornadas.map((jornada) => this.prisma.entrada.create({ data: { ...entrada, idJornada: jornada.id } }))
        );
    }

    async updateEntrada(id: number, data: UpdateEntradaDto) {
        const entrada = await this.obtenerEntrada(id);

        if (entrada.esBoleteria) {
            throw new ConflictException(SOLO_DESDE_BOLETERIA);
        }
        if (entrada.estado === 'Anulado') {
            throw new ConflictException('No se puede modificar un lote anulado');
        }
        /*
            Publicado (u impreso) el lote, sus tickets ya existen con su número
            y su precio: cambiar la cantidad o el precio los dejaría desfasados.
            Solo se puede corregir el nombre.
        */
        if (entrada.estado !== 'Borrador' && (data.cantidad !== undefined || data.precio !== undefined)) {
            throw new ConflictException('La cantidad y el precio de un lote publicado ya no se pueden cambiar: creá otro lote');
        }
        if (data.descripcion) {
            await this.validarDescripcionDisponible(entrada.idJornada, data.descripcion, id)
        }
        if (data.cantidad !== undefined) {
            // Sin contar este mismo lote: su cantidad vieja se reemplaza por la nueva
            const ocupados = (await lugaresOcupados(this.prisma, [entrada.idJornada], id)).get(entrada.idJornada) ?? 0;
            if (ocupados + data.cantidad > entrada.jornada.capacidad) {
                throw new ConflictException(`La cantidad de entradas excede la capacidad de la jornada. Capacidad restante: ${entrada.jornada.capacidad - ocupados}`);
            }
        }

        return this.prisma.entrada.update({
            where: { id },
            data
        })
    }

    /*
        Publicar es solo para los lotes ONLINE: crea todos sus tickets, a la
        venta. Un lote físico no se publica, se imprime (imprimirEntrada).
    */
    async publicarEntrada(id: number) {
        const entrada = await this.obtenerEntrada(id);

        if (entrada.esBoleteria) {
            throw new ConflictException(SOLO_DESDE_BOLETERIA);
        }
        if (entrada.esFisica) {
            throw new ConflictException('Un lote físico no se publica: se imprime');
        }
        if (entrada.jornada.estado !== "Activo") {
            throw new ConflictException('No se puede publicar una entrada de una jornada que no está activa');
        }
        if (entrada.estado !== "Borrador") {
            throw new ConflictException('Solo se pueden publicar lotes en borrador');
        }
        return this.prisma.$transaction((tx) => publicarLoteOnline(tx, entrada));
    }

    /*
        Habilitar/deshabilitar pausa o reanuda la venta online de un lote ya
        publicado. En Borrador no cambia nada (todavía no está a la venta) y
        un lote físico no se vende por el sistema, así que en esos casos no
        se permite. La boletería sí: pausarla corta la venta en la puerta
        (es lo que se hace con una que ya tuvo ventas, en vez de borrarla).
    */
    private async validarVentaPausable(id: number) {
        const entrada = await this.obtenerEntrada(id);
        if (entrada.esBoleteria) return;
        if (entrada.esFisica || entrada.estado !== 'Disponible') {
            throw new ConflictException('Solo se puede pausar o reanudar la venta de un lote online publicado');
        }
    }

    async habilitarEntrada(id: number) {
        await this.validarVentaPausable(id);
        return this.prisma.entrada.update({
            where: { id },
            data: {habilitada: true}
        })
    }

    async deshabilitarEntrada(id: number) {
        await this.validarVentaPausable(id);
        return this.prisma.entrada.update({
            where: { id },
            data: {habilitada: false}
        })
    }

    /*
        Anular un lote publicado o impreso: se corta para siempre. Sus tickets
        sin vender pasan a Anulado (no se borran) y dejan libre su lugar en
        la jornada; los vendidos siguen valiendo. Un lote en Borrador no se
        anula: no tiene tickets, se elimina.
    */
    async anularEntrada(id: number) {
        const entrada = await this.obtenerEntrada(id);

        // La boletería no se anula: se pausa (sus ventas se anulan una por una desde la puerta)
        if (entrada.esBoleteria) {
            throw new ConflictException(SOLO_DESDE_BOLETERIA);
        }
        if (entrada.estado !== 'Disponible') {
            throw new ConflictException('Solo se anulan lotes publicados o impresos: uno en borrador se elimina');
        }
        // Primero se pausa la venta, así no entra ninguna compra mientras se anula
        if (!entrada.esFisica && entrada.habilitada) {
            throw new ConflictException('Deshabilitá la venta del lote antes de anularlo');
        }

        return this.prisma.$transaction(async (tx) => {
            await liberarReservasVencidas(tx, [id]);
            const enEspera = await tx.ticketEvento.count({ where: { idEntrada: id, estado: 'Reservado' } });
            if (enEspera > 0) {
                throw new ConflictException(`Hay ${enEspera} ticket(s) de este lote en compras esperando el pago. Probá de nuevo en unos minutos`);
            }
            const asignados = await tx.ticketEvento.count({ where: { idEntrada: id, estado: 'Asignado' } });
            if (asignados > 0) {
                throw new ConflictException(`Hay ${asignados} ticket(s) asignados a puntos de venta: primero hay que rendirlos`);
            }

            await tx.ticketEvento.updateMany({
                where: { idEntrada: id, estado: { in: ['Disponible', 'Impreso'] } },
                data: { estado: 'Anulado' },
            });
            return tx.entrada.update({ where: { id }, data: { estado: 'Anulado', habilitada: false } });
        });
    }

    /*
        Imprimir es el "publicar" de un lote físico: crea todos sus tickets
        (Impresos) y devuelve el PDF para mandar a imprenta. El PDF se arma
        ANTES de guardar: si falla, no queda ningún ticket creado sin su
        archivo.
    */
    async imprimirEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: { id },
            include: { jornada: { include: { evento: true } } },
        })

        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        // Los tickets de la boletería se imprimen de a uno, en cada venta en la puerta
        if (entrada.esBoleteria) {
            throw new ConflictException(SOLO_DESDE_BOLETERIA);
        }
        if (!entrada.esFisica) {
            throw new ConflictException('Solo se imprimen los lotes físicos: uno online se publica');
        }
        if (entrada.estado !== "Borrador") {
            throw new ConflictException('Este lote ya fue impreso, no se puede volver a imprimir');
        }
        if (entrada.jornada.estado !== "Activo") {
            throw new ConflictException('No se puede imprimir un lote de una jornada que no está activa');
        }
        const nuevosTickets = armarTicketsDelLote(entrada, 'Impreso');
        const bufferPDF = await pdfDeTickets(
            { evento: entrada.jornada.evento.nombre, descripcion: entrada.descripcion, fechaJornada: entrada.jornada.fechaHoraInicio },
            nuevosTickets,
        );

        // Con el PDF listo, se guardan los tickets y el lote queda impreso (todo o nada)
        await this.prisma.$transaction(async (tx) => {
            // Otro usuario pudo imprimirlo mientras se armaba el PDF: solo se pasa si sigue en Borrador
            const impreso = await tx.entrada.updateMany({
                where: { id, estado: 'Borrador' },
                data: { estado: 'Disponible' },
            });
            if (impreso.count === 0) {
                throw new ConflictException('Este lote ya fue impreso, no se puede volver a imprimir');
            }
            await tx.ticketEvento.createMany({ data: nuevosTickets });
        });

        return bufferPDF;
    }


    /*
        Solo se elimina un lote en Borrador: todavía no tiene tickets. Uno
        publicado o impreso ya los tiene y se anula (anularEntrada).
    */
    async deleteEntrada(id: number) {
        const entrada = await this.obtenerEntrada(id);
        /*
            La boletería se puede quitar mientras no haya vendido nada. Si ya
            tuvo ventas, sus tickets la necesitan (y los informes también):
            en vez de borrarla, se pausa.
        */
        if (entrada.esBoleteria) {
            const tickets = await this.prisma.ticketEvento.count({ where: { idEntrada: id } });
            if (tickets > 0) {
                throw new ConflictException('La boletería ya tuvo ventas: no se puede quitar, pausala');
            }
            return this.prisma.entrada.delete({ where: { id } });
        }
        if (entrada.estado !== "Borrador") {
            throw new ConflictException('Un lote publicado o impreso no se elimina: se anula');
        }
        return this.prisma.entrada.delete({ where: { id } });
    }

    /*
        Configura la boletería en las jornadas elegidas (todas juntas o una por
        una, como un lote): si la jornada ya tiene, le cambia el precio; si
        no, la crea. El nombre lo pone el sistema. No ocupa lugares al crearse
        (cantidad 0): los ocupan los tickets que se venden en la puerta.
        Todo o nada: si una jornada tiene un problema, no se toca ninguna.
    */
    async configurarBoleteria(data: ConfigurarBoleteriaDto) {
        const jornadas = await this.prisma.jornada.findMany({
            where: { id: { in: data.idsJornadas } },
            orderBy: { fechaHoraInicio: 'asc' },
        });
        if (jornadas.length !== data.idsJornadas.length) {
            throw new NotFoundException('Alguna de las jornadas elegidas no existe');
        }
        if (new Set(jornadas.map((j) => j.idEvento)).size > 1) {
            throw new BadRequestException('Las jornadas elegidas tienen que ser del mismo evento');
        }
        // Igual que los lotes: no en jornadas cerradas, ni en suspendidas (se configura al reprogramarla)
        const noAptas = jornadas.filter((j) => j.estado === 'Finalizado' || j.estado === 'Cancelado' || j.estado === 'Suspendido');
        if (noAptas.length > 0) {
            const nombres = noAptas.map((j) => j.nombre ?? j.fechaHoraInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));
            throw new ConflictException(`No se configura la boletería de jornadas finalizadas, canceladas o suspendidas: ${nombres.join(', ')}`);
        }

        return this.prisma.$transaction(async (tx) => {
            const existentes = await tx.entrada.findMany({
                where: { idJornada: { in: data.idsJornadas }, esBoleteria: true },
            });
            const boleteriaDe = new Map(existentes.map((e) => [e.idJornada, e]));

            return Promise.all(
                jornadas.map((jornada) => {
                    const existente = boleteriaDe.get(jornada.id);
                    if (existente) {
                        // Las ventas anteriores guardaron su precio en cada ticket: cambiarlo no las toca
                        return tx.entrada.update({ where: { id: existente.id }, data: { precio: data.precio } });
                    }
                    return tx.entrada.create({
                        data: {
                            idJornada: jornada.id,
                            descripcion: NOMBRE_BOLETERIA,
                            precio: data.precio,
                            // Sus tickets se imprimen en papel en la boletería
                            esFisica: true,
                            esBoleteria: true,
                            cantidad: 0,
                            // No necesita publicarse: se vende cuando la jornada se puede operar
                            estado: 'Disponible',
                        },
                    });
                }),
            );
        });
    }

    // "General Boletería" es el nombre de la boletería: ningún lote común puede usarlo
    private validarNombreNoReservado(descripcion: string) {
        if (esNombreReservado(descripcion)) {
            throw new ConflictException(`«${NOMBRE_BOLETERIA}» es el nombre reservado de la boletería: elegí otro nombre para el lote`);
        }
    }

    // El nombre solo tiene que ser único dentro de la jornada: "General" puede repetirse en cada día
    private async validarDescripcionDisponible(idJornada: number, descripcion: string, idIgnorado?: number) {
        this.validarNombreNoReservado(descripcion);
        const otros = await this.prisma.entrada.findMany({
            where: { idJornada, id: idIgnorado ? { not: idIgnorado } : undefined },
            select: { descripcion: true },
        });
        if (otros.some((otro) => mismoNombre(otro.descripcion, descripcion))) {
            throw new ConflictException('Ya existe una entrada con ese nombre para esta jornada');
        }
    }


}
