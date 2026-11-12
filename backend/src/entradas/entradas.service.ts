import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntradaDto } from './dtos/create.entrada.dto';
import { CreateEntradasLoteDto } from './dtos/create.entradas-lote.dto';
import { UpdateEntradaDto } from './dtos/update.entrada.dto';
import PDFDocument from 'pdfkit';
import { generarQR } from './utils/generarQR';
import { armarTicketsDelLote, liberarReservasVencidas, lugaresOcupados, publicarLoteOnline } from './utils/tickets';


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
        const conMismoNombre = await this.prisma.entrada.findMany({
            where: { idJornada: { in: idsJornadas }, descripcion: { equals: entrada.descripcion, mode: 'insensitive' } },
            select: { idJornada: true },
        });
        const nombreOcupado = new Set(conMismoNombre.map((e) => e.idJornada));

        // Cuántos lugares tiene ya comprometidos cada jornada
        const yaAsignadas = await lugaresOcupados(this.prisma, idsJornadas);

        const problemas: string[] = [];
        for (const jornada of jornadas) {
            const cual = jornada.nombre || `La jornada del ${jornada.fechaHoraInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`;

            if (jornada.estado === 'Finalizado' || jornada.estado === 'Cancelado') {
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
        se permite.
    */
    private async validarVentaPausable(id: number) {
        const entrada = await this.obtenerEntrada(id);
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

        const QRsGenerados = await Promise.all(
            nuevosTickets.map(async (ticket) => ({
                ticket,
                qr: await generarQR(ticket.codigoQR)
        })));
        function centrarX(doc: PDFKit.PDFDocument, texto: string, anchoPagina: number, ): number {
            return (anchoPagina - doc.widthOfString(texto)) / 2;
        }

        function ajustarFontSize(doc: PDFKit.PDFDocument, texto: string, anchoMaximo: number, tamanoInicial: number, tamanoMinimo: number): number {
            let tamano = tamanoInicial;
            doc.fontSize(tamano);
            while (doc.widthOfString(texto) > anchoMaximo && tamano > tamanoMinimo) {
                tamano--;
                doc.fontSize(tamano);
            }
            return tamano;
        }

        // Los tickets de distintas jornadas del mismo evento se distinguen por la fecha impresa
        const fechaJornada = entrada.jornada.fechaHoraInicio.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Argentina/Buenos_Aires',
        });
        const ticketsPDF = new PDFDocument({ autoFirstPage: false});
        for (const { ticket, qr } of QRsGenerados) {

            ticketsPDF.addPage({ size: [300, 300], margins: { top: 0, bottom: 0, left: 0, right: 0 }, });
            ticketsPDF.font('Helvetica-Bold');
            ajustarFontSize(ticketsPDF, `${entrada.jornada.evento.nombre}`, 280, 18, 10);
            ticketsPDF.text(`${entrada.jornada.evento.nombre}`, centrarX(ticketsPDF, `${entrada.jornada.evento.nombre}`, 300), 20);
            ticketsPDF.image(qr, (300-200)/2, 50, { width: 200, height: 200 });
            const numeroYFecha = `#${ticket.numero} - ${fechaJornada}`;
            ticketsPDF.font('Helvetica-Bold').fontSize(12).text(numeroYFecha, centrarX(ticketsPDF, numeroYFecha, 300), 250);
            ajustarFontSize(ticketsPDF, `${entrada.descripcion}`, 280, 10, 8);
            ticketsPDF.font('Helvetica').fontSize(12).text(`${entrada.descripcion}`,centrarX(ticketsPDF, `${entrada.descripcion}`, 300), 263);
            
        }
        const bufferPDF = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];

            ticketsPDF.on('data', (chunk) => chunks.push(chunk));
            ticketsPDF.on('end', () => resolve(Buffer.concat(chunks)));
            ticketsPDF.on('error', reject);

            ticketsPDF.end();
        });

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
        if (entrada.estado !== "Borrador") {
            throw new ConflictException('Un lote publicado o impreso no se elimina: se anula');
        }
        return this.prisma.entrada.delete({ where: { id } });
    }

    // El nombre solo tiene que ser único dentro de la jornada: "General" puede repetirse en cada día
    private async validarDescripcionDisponible(idJornada: number, descripcion: string, idIgnorado?: number) {
        const existente = await this.prisma.entrada.findFirst({
            where: {
                idJornada,
                descripcion: { equals: descripcion, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });
        if (existente) {
            throw new ConflictException('Ya existe una entrada con ese nombre para esta jornada');
        }
    }


}
