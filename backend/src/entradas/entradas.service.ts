import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EstadoEntrada } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntradaDto } from './dtos/create.entrada.dto';
import { UpdateEntradaDto } from './dtos/update.entrada.dto';
import { randomUUID } from 'crypto';
import PDFDocument from 'pdfkit';
import { generarQR } from './utils/generarQR';


@Injectable()
export class EntradasService {
    constructor(private prisma: PrismaService) {}

    // Se puede listar por jornada o por evento (todas las entradas de todas sus jornadas)
    async findAll(filtro: { idJornada?: number; idEvento?: number }) {
        const entradas = await this.prisma.entrada.findMany({
            where: {
                idJornada: filtro.idJornada,
                jornada: filtro.idEvento ? { idEvento: filtro.idEvento } : undefined,
            },
            include: {
                jornada: { select: { id: true, nombre: true, fechaHoraInicio: true } },
                _count: { select: { tickets: true } },
            },
            orderBy: [{ jornada: { fechaHoraInicio: 'asc' } }, { id: 'asc' }],
        });

        return entradas.map((entrada) => {
            const { _count, ...resto } = entrada;
            return { ...resto, cantidadTicket: _count.tickets };
        });
    }


    findOne(id: number) {
        return this.prisma.entrada.findUnique({ where: { id } });
    }

    async createEntrada(data: CreateEntradaDto) {
        const jornada = await this.prisma.jornada.findUnique({ where: { id: data.idJornada } });
        if (!jornada) {
            throw new NotFoundException('No existe la jornada a la que intentas asociar la entrada');
        }
        if (jornada.estado === "Finalizado" || jornada.estado === "Cancelado") {
            throw new ConflictException('No se puede crear una entrada para una jornada finalizada o cancelada');
        }
        const suma = await this.prisma.entrada.aggregate({
            where: { idJornada: data.idJornada },
            _sum: { cantidad: true },
        })
        if (data.cantidad !== undefined && ((suma._sum.cantidad ?? 0) + data.cantidad > jornada.capacidad) ){
            throw new ConflictException(`La cantidad de entradas excede la capacidad de la jornada. Capacidad restante: ${jornada.capacidad - (suma._sum.cantidad ?? 0)}`);
        }
        await this.validarDescripcionDisponible(data.idJornada, data.descripcion);
        return this.prisma.entrada.create({ data });
    }

    async updateEntrada(id: number, data: UpdateEntradaDto) {
        const entrada = await this.findOne(id);
        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if (data.descripcion) {
            await this.validarDescripcionDisponible(entrada.idJornada, data.descripcion, id)
        }
        if (data.cantidad !== undefined) {
            if (entrada.estado !== "Borrador") {
                throw new ConflictException('No se puede modificar la cantidad de una entrada que ya fue publicada');
            }
            const jornada = await this.prisma.jornada.findUnique({ where: { id: entrada.idJornada } });
            if (!jornada) {
                throw new NotFoundException('No existe la jornada a la que pertenece la entrada');
            }
            const suma = await this.prisma.entrada.aggregate({
                where: { idJornada: entrada.idJornada, id: { not: id } },
                _sum: { cantidad: true },
            })
            if ((suma._sum.cantidad ?? 0) + data.cantidad > jornada.capacidad) {
                throw new ConflictException(`La cantidad de entradas excede la capacidad de la jornada. Capacidad restante: ${jornada.capacidad - (suma._sum.cantidad ?? 0)}`);
            }
        }

        return this.prisma.entrada.update({
            where: { id },
            data
        })
    }


    async publicarEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: { id },
            include: { jornada: true },
         
        })

        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if (entrada.jornada.estado !== "Activo") {
            throw new ConflictException('No se puede publicar una entrada de una jornada que no está activa');
        }
        if (entrada.estado !== "Borrador") {
            throw new ConflictException('No se puede publicar esta entrada');
        }
        if (!entrada.habilitada) {
            throw new ConflictException('No se puede publicar una entrada deshabilitada');
        }
        return this.prisma.entrada.update({
            where: { id },
            data: { estado: "Disponible" }
        })
    }

    habilitarEntrada(id: number, ) {
        return this.prisma.entrada.update({
            where: { id },
            data: {habilitada: true}
        })
    }

    deshabilitarEntrada(id: number) {
        return this.prisma.entrada.update({
            where: { id },
            data: {habilitada: false}
        })
    }

    async imprimirEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: { id },
            include: { 
                jornada: { include: { evento: true } },
                _count: { select: { tickets: true } }
            },    
        })
        
        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if (entrada._count.tickets > 0){
            throw new ConflictException('Estos tickets ya fueron impresos, no se pueden volver a imprimir');
        }
        if (entrada.jornada.estado !== "Activo") {
            throw new ConflictException('No se puede imprimir una entrada de una jornada que no está activa');
        }
        if (entrada.estado !== "Disponible") {
            throw new ConflictException('No se puede imprimir esta entrada todavia');
        }
        if (!entrada.habilitada) {
            throw new ConflictException('No se puede imprimir una entrada deshabilitada');
        }
        if (!entrada.esFisica) {
            throw new ConflictException('No se puede imprimir una entrada que no es física');
        }
        if (entrada.cantidad === null || entrada.cantidad <= 0) {
            throw new ConflictException('No se puede imprimir una entrada física sin cantidad definida');
        }
        const nuevosTickets = Array.from({length: entrada.cantidad},(_, i) => ({
            idEntrada: entrada.id,
            codigoQR: randomUUID() ,
            numero: String(i + 1),
            precio: entrada.precio,
            estado: "Impreso" as const,
            
        }));
        const tickets = await this.prisma.ticketEvento.createMany({
            data: nuevosTickets,
        })
        
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

        return bufferPDF;
    }


    async deleteEntrada(id: number) {
        const entrada = await this.prisma.entrada.findUnique({
            where: {id},
            include:{ _count: { select: { tickets: true}}}
        })
        if (!entrada) {
            throw new NotFoundException('La entrada no existe');
        }
        if(entrada._count.tickets > 0){
            throw new ConflictException('No se puede eliminar la entrada porque tiene tickets asociados');
        }
        if (entrada.estado !== "Borrador" && entrada.habilitada) {
            throw new ConflictException('No se puede eliminar esta entrada');
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
