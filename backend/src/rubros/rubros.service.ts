import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRubroDto } from './dtos/create.rubro.dto';
import { UpdateRubroDto } from './dtos/update.rubro.dto';

@Injectable()
export class RubrosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.rubro.findMany({ orderBy: { nombre: 'asc' } });
    }

    findOne(id: number) {
        return this.prisma.rubro.findUnique({ where: { id } });
    }

    /*
        Rubro.nombre no tiene @unique en el schema, así que el duplicado lo
        controlamos acá con una consulta previa en vez de atrapar el P2002 de
        Prisma. mode: 'insensitive' hace que "Publicidad" y "publicidad" cuenten
        como el mismo rubro. idIgnorado sirve para editar: al modificar el rubro 5
        no queremos que choque contra sí mismo.
    */
    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const existente = await this.prisma.rubro.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });

        if (existente) {
            throw new ConflictException('Ya existe un rubro con ese nombre');
        }
    }

    async create(data: CreateRubroDto) {
        await this.validarNombreDisponible(data.nombre);

        return this.prisma.rubro.create({ data });
    }

    async update(id: number, data: UpdateRubroDto) {
        const rubro = await this.findOne(id);
        if (!rubro) {
            throw new NotFoundException('No existe el rubro que intentás editar');
        }

        if (data.nombre) {
            await this.validarNombreDisponible(data.nombre, id);
        }

        return this.prisma.rubro.update({ where: { id }, data });
    }

    async remove(id: number) {
        const rubro = await this.findOne(id);
        if (!rubro) {
            throw new NotFoundException('No existe el rubro que intentás eliminar');
        }

        /*
            Borrado físico, pero solo si el rubro está "libre": si ya se usó para
            registrar plata o tiene proveedores colgando, borrarlo rompería esos
            registros (o directamente explotaría por la FK).
        */
        const movimientos = await this.prisma.movimientoFinanciero.count({ where: { idRubro: id } });
        if (movimientos !== 0) {
            throw new ConflictException('No se puede eliminar: el rubro tiene movimientos financieros registrados');
        }

        const proveedores = await this.prisma.proveedorRubro.count({ where: { idRubro: id } });
        if (proveedores !== 0) {
            throw new ConflictException('No se puede eliminar: el rubro tiene proveedores asociados');
        }

        return this.prisma.rubro.delete({ where: { id } });
    }
}
