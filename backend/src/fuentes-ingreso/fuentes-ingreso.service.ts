import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateFuenteDto } from './dtos/create.fuente.dto';
import { UpdateFuenteDto } from './dtos/update.fuente.dto';

/*
    Espejo de ProveedoresService, del lado de los ingresos: una fuente es quien
    le paga al evento (sponsor, puestero, organismo que da un subsidio).
*/
@Injectable()
export class FuentesIngresoService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        const fuentes = await this.prisma.fuenteIngreso.findMany({
            orderBy: { nombre: 'asc' },
            include: { rubros: { include: { rubro: true } } },
        });

        return fuentes.map(({ rubros, ...fuente }) => ({
            ...fuente,
            rubros: rubros.map((fila) => fila.rubro),
        }));
    }

    async findOne(id: number) {
        const fuente = await this.prisma.fuenteIngreso.findUnique({
            where: { id },
            include: { rubros: { include: { rubro: true } } },
        });

        if (!fuente) return null;

        const { rubros, ...datosFuente } = fuente;
        return { ...datosFuente, rubros: rubros.map((fila) => fila.rubro) };
    }

    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const existente = await this.prisma.fuenteIngreso.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });

        if (existente) {
            throw new ConflictException('Ya existe una fuente de ingreso con ese nombre');
        }
    }

    // Una fuente le paga al evento: no puede estar en un rubro que solo es de gasto.
    private async validarTiposRubros(idsRubros: number[]) {
        const rubrosInvalidos = await this.prisma.rubro.findMany({
            where: { id: { in: idsRubros }, tipo: 'Gasto' },
            select: { nombre: true },
        });

        if (rubrosInvalidos.length > 0) {
            throw new BadRequestException(
                `Una fuente de ingreso solo puede tener rubros de tipo Ingreso o Mixto. No corresponde: ${rubrosInvalidos.map((r) => r.nombre).join(', ')}`,
            );
        }
    }

    private manejarErrorPrisma(err: unknown): never {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new ConflictException('Ya existe una fuente de ingreso con ese email');
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
            throw new BadRequestException('Uno de los rubros indicados no existe');
        }
        throw err;
    }

    async create(data: CreateFuenteDto) {
        const { idsRubros, estado, ...datosFuente } = data;

        await this.validarNombreDisponible(data.nombre);
        await this.validarTiposRubros(idsRubros);

        try {
            return await this.prisma.$transaction(async (tx) => {
                const fuente = await tx.fuenteIngreso.create({
                    data: { ...datosFuente, estado: estado ?? 'Activo' },
                });

                await tx.fuenteIngresoRubro.createMany({
                    data: idsRubros.map((idRubro) => ({ idFuente: fuente.id, idRubro })),
                });

                return fuente;
            });
        } catch (err) {
            this.manejarErrorPrisma(err);
        }
    }

    async update(id: number, data: UpdateFuenteDto) {
        const { idsRubros, ...datosFuente } = data;

        const fuente = await this.findOne(id);
        if (!fuente) {
            throw new NotFoundException('No existe la fuente de ingreso que intentás editar');
        }

        if (data.nombre) {
            await this.validarNombreDisponible(data.nombre, id);
        }
        if (idsRubros) {
            await this.validarTiposRubros(idsRubros);
        }

        try {
            return await this.prisma.$transaction(async (tx) => {
                const actualizada = await tx.fuenteIngreso.update({ where: { id }, data: datosFuente });

                if (idsRubros) {
                    await tx.fuenteIngresoRubro.deleteMany({ where: { idFuente: id } });
                    await tx.fuenteIngresoRubro.createMany({
                        data: idsRubros.map((idRubro) => ({ idFuente: id, idRubro })),
                    });
                }

                return actualizada;
            });
        } catch (err) {
            this.manejarErrorPrisma(err);
        }
    }

    async remove(id: number) {
        const fuente = await this.findOne(id);
        if (!fuente) {
            throw new NotFoundException('No existe la fuente de ingreso que intentás eliminar');
        }

        const movimientos = await this.prisma.movimientoFinanciero.count({ where: { idFuente: id } });
        if (movimientos !== 0) {
            throw new ConflictException(
                'No se puede eliminar: la fuente tiene ingresos registrados. Bloqueala en vez de eliminarla',
            );
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.fuenteIngresoRubro.deleteMany({ where: { idFuente: id } });
            return tx.fuenteIngreso.delete({ where: { id } });
        });
    }
}
