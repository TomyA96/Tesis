import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { UpdateEventoDto } from './dtos/update.evento.dto';
import { ReprogramarEventoDto } from './dtos/reprogramar.evento.dto';
import { ImagenEventoService } from '../imagen-evento/imagen-evento.service';
import { error } from 'console';

@Injectable()
export class EventosService {
    constructor(private prisma: PrismaService, private imagenEventoService: ImagenEventoService) {}

    findAll() {
        return this.prisma.evento.findMany({orderBy: {fechaHoraInicio: 'asc'}})    
    }

    /*
        Un evento en Borrador todavía no se decidió hacer, así que no tiene
        sentido cargarle movimientos financieros. El resto (incluso Finalizado
        o Cancelado) sí: una factura puede llegar tarde, o un evento cancelado
        puede haber dejado gastos ya comprometidos.
    */
    findAllPublicados() {
        return this.prisma.evento.findMany({
            where: { estado: { not: "Borrador" } },
            orderBy: { fechaHoraInicio: 'asc' }
        })
    }

    findAllActivos(){
        return this.prisma.evento.findMany(
            {
                where: {estado: 'Activo'},
                include: {imagenes: true}, 
                orderBy: { fechaHoraInicio: 'asc' }
            }
        )
    }

    findOne(id: number) {
        return this.prisma.evento.findUnique({ where: { id } });
    }

    async findOneEventoPublico(id: number){

        const evento = await this.prisma.evento.findFirst({
            where: {id, estado:'Activo'},
            include: {
                imagenes: true,
                entradas: {
                    where: {estado: 'Disponible', habilitada: true, esFisica: false},
                    select: {id: true, descripcion: true, precio: true},
                    orderBy: {precio: 'asc'} 
                }
            }
        })

        if(!evento){
            throw new NotFoundException('El evento no existe o no esta activo')
        }
        return evento
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

        if (evento.estado !== "Borrador"){
            throw new ConflictException("No puedes eliminar eventos que esten publicados o finalizados")
        }

        const movimientos = await this.prisma.movimientoFinanciero.count({ where: { idEvento: id } });
        if (movimientos > 0) {
            throw new ConflictException('No se puede eliminar: el evento tiene movimientos financieros registrados');
        }
        /*
            Si el evento sigue en Borrador, nunca estuvo Activo — y
            publicarEntrada exige evento Activo para sacar una entrada de
            Borrador (ver entradas.service.ts). Por lo tanto ninguna de sus
            entradas pudo publicarse ni tener tickets o ventas reales: son
            seguras de borrar en cascada junto con el evento, en vez de
            obligar a borrarlas una por una a mano.
        */
        const imagenes = await this.imagenEventoService.findAllByEvento(id);
        for (const imagen of imagenes) {
            await this.imagenEventoService.remove(imagen.id);
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({ where: { idEvento: id } });
            return tx.evento.delete({ where: { id } });
        });
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

        const imagenes = await this.prisma.imagenEvento.count({
            where: {idEvento: id}
        })

        if (imagenes === 0){
            throw new ConflictException('No se puede publicar un evento sin una imagen publicitaria')
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
