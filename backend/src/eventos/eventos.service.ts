import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dtos/create.evento.dto';
import { UpdateEventoDto } from './dtos/update.evento.dto';

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
}
