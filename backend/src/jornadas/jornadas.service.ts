import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJornadaDto } from './dtos/create.jornada.dto';
import { UpdateJornadaDto } from './dtos/update.jornada.dto';
import { ReprogramarJornadaDto } from './dtos/reprogramar.jornada.dto';

@Injectable()
export class JornadasService {
    constructor(private prisma: PrismaService) {}

    findAllByEvento(idEvento: number) {
        return this.prisma.jornada.findMany({
            where: { idEvento },
            orderBy: { fechaHoraInicio: 'asc' }
        });
    }

    async findOne(id: number) {
        const jornada = await this.prisma.jornada.findUnique({ where: { id } });
        if (!jornada) {
            throw new NotFoundException('No existe la jornada');
        }
        return jornada;
    }

    // El fin puede caer en otro día (22:00 a 03:00), pero siempre es posterior al inicio
    private validarFechas(inicio: Date, fin: Date) {
        if (fin <= inicio) {
            throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio');
        }
    }

    async create(idEvento: number, data: CreateJornadaDto) {
        const evento = await this.prisma.evento.findUnique({ where: { id: idEvento } });
        if (!evento) {
            throw new NotFoundException('No existe el evento al que intentas agregar la jornada');
        }
        // Mientras el evento no se finalice, se le pueden seguir sumando jornadas
        if (evento.estado === 'Finalizado') {
            throw new ConflictException('No se pueden agregar jornadas a un evento finalizado');
        }
        this.validarFechas(data.fechaHoraInicio, data.fechaHoraFin);

        return this.prisma.jornada.create({ data: { ...data, idEvento } });
    }

    async update(id: number, data: UpdateJornadaDto) {
        const jornada = await this.findOne(id);

        // Una jornada cerrada es historia: no se puede reescribir lo que ya pasó.
        if (jornada.estado === 'Finalizado' || jornada.estado === 'Cancelado') {
            throw new ConflictException('No se puede modificar una jornada finalizada o cancelada');
        }
        /*
            La fecha de una jornada que ya está en vivo o suspendida no se toca
            por acá: Activa debería resolverse suspendiendo primero, y
            Suspendida tiene su propio flujo (reprogramar) con sus propias
            validaciones.
        */
        if (jornada.estado !== 'Borrador' && (data.fechaHoraInicio || data.fechaHoraFin)) {
            throw new ConflictException('Solo se puede modificar la fecha de una jornada en Borrador. Para jornadas activas o suspendidas, usá Reprogramar.');
        }

        // Si solo mandan una de las dos fechas, la otra es la que ya estaba guardada
        this.validarFechas(
            data.fechaHoraInicio ?? jornada.fechaHoraInicio,
            data.fechaHoraFin ?? jornada.fechaHoraFin
        );

        return this.prisma.jornada.update({ where: { id }, data });
    }

    async remove(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Borrador') {
            throw new ConflictException('No puedes eliminar jornadas que estén publicadas o finalizadas');
        }

        const jornadasDelEvento = await this.prisma.jornada.count({ where: { idEvento: jornada.idEvento } });
        if (jornadasDelEvento === 1) {
            throw new ConflictException('Un evento necesita al menos una jornada: para quitar la última, eliminá el evento');
        }
        /*
            Si la jornada sigue en Borrador, nunca estuvo Activa — y para
            sacar una entrada de Borrador hace falta que la jornada esté
            Activa. Ninguna de sus entradas pudo publicarse ni tener tickets
            o ventas reales: son seguras de borrar en cascada.
        */
        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({ where: { idJornada: id } });
            return tx.jornada.delete({ where: { id } });
        });
    }

    async publicar(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Borrador') {
            throw new ConflictException('Solo se pueden publicar jornadas que estén en estado Borrador');
        }
        // Una jornada solo se publica dentro de un evento ya publicado
        const evento = await this.prisma.evento.findUnique({ where: { id: jornada.idEvento } });
        if (evento?.estado !== 'Activo') {
            throw new ConflictException('Publicá el evento antes de publicar sus jornadas');
        }
        if (jornada.fechaHoraInicio <= new Date()) {
            throw new ConflictException('No se puede publicar una jornada cuya fecha ya pasó');
        }
        if (jornada.fechaHoraFin <= jornada.fechaHoraInicio) {
            throw new ConflictException('La fecha de fin debe ser posterior a la de inicio');
        }

        const entradasVendibles = await this.prisma.entrada.count({
            where: { idJornada: id, habilitada: true }
        });
        if (entradasVendibles === 0) {
            throw new ConflictException('No se puede publicar una jornada sin entradas cargadas');
        }

        // La imagen es del evento completo, no de cada jornada
        const imagenes = await this.prisma.imagenEvento.count({
            where: { idEvento: jornada.idEvento }
        });
        if (imagenes === 0) {
            throw new ConflictException('No se puede publicar una jornada si el evento no tiene una imagen publicitaria');
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.updateMany({
                where: { idJornada: id, estado: 'Borrador', habilitada: true },
                data: { estado: 'Disponible' }
            });
            return tx.jornada.update({ where: { id }, data: { estado: 'Activo' } });
        });
    }

    async cancelar(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Activo' && jornada.estado !== 'Suspendido') {
            throw new ConflictException('No es posible cancelar esta jornada');
        }
        /*
            Una entrada en Borrador nunca se publicó — no tuvo existencia
            pública, no pudo venderse, y la jornada ya no va a volver a estar
            activa. Se borra en cascada, no queda como residuo inservible.
            El filtro por tickets es una red de seguridad: una entrada en
            Borrador nunca debería tener tickets asociados.
        */
        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({
                where: { idJornada: id, estado: 'Borrador', tickets: { none: {} } }
            });
            return tx.jornada.update({ where: { id }, data: { estado: 'Cancelado' } });
        });
    }

    async suspender(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Activo') {
            throw new ConflictException('No es posible suspender esta jornada');
        }
        return this.prisma.jornada.update({ where: { id }, data: { estado: 'Suspendido' } });
    }

    async finalizar(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Activo') {
            throw new ConflictException('No es posible finalizar esta jornada');
        }
        // Mismo criterio que cancelar — ver el comentario ahí.
        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({
                where: { idJornada: id, estado: 'Borrador', tickets: { none: {} } }
            });
            return tx.jornada.update({ where: { id }, data: { estado: 'Finalizado' } });
        });
    }

    async reprogramar(id: number, data: ReprogramarJornadaDto) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Suspendido') {
            throw new ConflictException('Solo se pueden reprogramar jornadas que estén suspendidas');
        }
        if (data.fechaHoraInicio <= new Date()) {
            throw new ConflictException('La nueva fecha de inicio no puede ser anterior a la fecha actual');
        }
        if (data.fechaHoraFin <= data.fechaHoraInicio) {
            throw new ConflictException('La fecha de fin debe ser posterior a la de inicio');
        }

        const entradasVendibles = await this.prisma.entrada.count({
            where: { idJornada: id, habilitada: true }
        });
        if (entradasVendibles === 0) {
            throw new ConflictException('No se puede reprogramar una jornada sin entradas disponibles para la venta');
        }

        return this.prisma.jornada.update({
            where: { id },
            data: { ...data, estado: 'Activo' }
        });
    }
}
