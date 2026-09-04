import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { UpdateEventoDto } from './dtos/update.evento.dto';
import { ReprogramarEventoDto } from './dtos/reprogramar.evento.dto';

@Injectable()
export class EventosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.evento.findMany()    
    }

    findOne(id: number) {
        return this.prisma.evento.findUnique({ where: { id } });
    }

    create(data: CreateEventoDto) {
        return this.prisma.evento.create( { data } );
    }

    async updateEvento(id: number, data: UpdateEventoDto) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas editar')
        }
        // Un evento cerrado es historia: no se puede reescribir lo que ya pasó.
        if (evento.estado === "Finalizado" || evento.estado === "Cancelado"){
            throw new ConflictException('No se puede modificar un evento finalizado o cancelado')
        }
        /*
            La fecha de un evento que ya está en vivo o suspendido no se toca
            por acá: Activo debería resolverse suspendiendo primero, y
            Suspendido tiene su propio flujo (reprogramarEvento) con sus
            propias validaciones. El frontend ya deshabilita estos campos en
            ese caso, pero eso no protege al endpoint de un request directo.
        */
        if (evento.estado !== "Borrador" && (data.fechaHoraInicio || data.fechaHoraFin)) {
            throw new ConflictException('Solo se puede modificar la fecha de un evento en Borrador. Para eventos activos o suspendidos, usá Reprogramar.');
        }

        return this.prisma.evento.update({ where: { id }, data });
    }

    async removeEvento(id: number) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas eliminar')
        }

        /*
            El estado por sí solo no garantiza que el evento esté "vacío": nada
            impide hoy cargar entradas o movimientos para un evento en Borrador.
            Por eso se chequean las relaciones directamente, no solo el estado.
        */
        const entradas = await this.prisma.entrada.count({ where: { idEvento: id } });
        if (entradas > 0) {
            throw new ConflictException('No se puede eliminar: el evento tiene entradas asociadas');
        }

        const movimientos = await this.prisma.movimientoFinanciero.count({ where: { idEvento: id } });
        if (movimientos > 0) {
            throw new ConflictException('No se puede eliminar: el evento tiene movimientos financieros registrados');
        }

        if (evento.estado !== "Borrador"){
            throw new ConflictException("No puedes eliminar eventos que esten publicados o finalizados")
        }
        return this.prisma.evento.delete({ where: { id } });
    }

    async publicarEvento(id: number) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas publicar')
        }
        if (evento.estado !== "Borrador"){
            throw new ConflictException("Solo se pueden publicar eventos que estén en estado Borrador")
        }
        if (evento.fechaHoraInicio <= new Date()) {
            throw new ConflictException('No se puede publicar un evento cuya fecha ya pasó');
        }
        if (evento.fechaHoraFin <= evento.fechaHoraInicio) {
            throw new ConflictException('La fecha de fin debe ser posterior a la de inicio');
        }

        const entradasVendibles = await this.prisma.entrada.count({
            where: { idEvento: id, habilitada: true }
        });
        if (entradasVendibles === 0) {
            throw new ConflictException('No se puede publicar un evento sin entradas cargadas');
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.updateMany({
                where: { idEvento: id, estado: "Borrador", habilitada: true },
                data: { estado: "Disponible" }
            });
            return tx.evento.update({ where: { id }, data: { estado: "Activo" } });
        });
    }

    async cancelarEvento(id: number) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas cancelar')
        }
        if (evento.estado !== "Activo" && evento.estado !== "Suspendido"){
            throw new ConflictException("No es posible cancelar este evento")
        }
        /*
            Una entrada en Borrador nunca se publicó — no tuvo existencia
            pública, no pudo venderse, y el evento ya no va a volver a estar
            activo. Se borra en cascada, no queda como residuo inservible.
            El filtro por tickets es una red de seguridad: una entrada en
            Borrador nunca debería tener tickets asociados (se generan recién
            después de publicar), pero preferimos no confiar ciegamente en eso.
        */
        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({
                where: { idEvento: id, estado: "Borrador", tickets: { none: {} } }
            });
            return tx.evento.update({ where: { id }, data: { estado: "Cancelado" } });
        });
    }

    async suspenderEvento(id: number) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas suspender')
        }
        if (evento.estado !== "Activo"){
            throw new ConflictException("No es posible suspender este evento")
        }
        return this.prisma.evento.update({ where: { id }, data: { estado: "Suspendido" } });
    }

    async finalizarEvento(id: number) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas finalizar')
        }
        if (evento.estado !== "Activo"){
            throw new ConflictException("No es posible finalizar este evento")
        }
        // Mismo criterio que cancelarEvento — ver el comentario ahí.
        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({
                where: { idEvento: id, estado: "Borrador", tickets: { none: {} } }
            });
            return tx.evento.update({ where: { id }, data: { estado: "Finalizado" } });
        });
    }

    async reprogramarEvento(id: number, data: ReprogramarEventoDto) {
        const evento = await this.findOne(id)
        if (!evento){
            throw new NotFoundException('No existe el evento que intentas reprogramar')
        }
        if (evento.estado !== "Suspendido"){
            throw new ConflictException("Solo se pueden reprogramar eventos que estén suspendidos")
        }
        if (data.fechaHoraInicio <= new Date()) {
            throw new ConflictException('La nueva fecha de inicio no puede ser anterior a la fecha actual');
        }
        if (data.fechaHoraFin <= data.fechaHoraInicio) {
            throw new ConflictException('La fecha de fin debe ser posterior a la de inicio');
        }

        const entradasVendibles = await this.prisma.entrada.count({
            where: { idEvento: id, habilitada: true}
        });
        if (entradasVendibles === 0) {
            throw new ConflictException('No se puede reprogramar un evento sin entradas disponibles para la venta');
        }

        return this.prisma.evento.update({
            where: { id },
            data: { ...data, estado: "Activo" }
        });
    }
}
