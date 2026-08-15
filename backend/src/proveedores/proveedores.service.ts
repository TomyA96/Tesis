import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProveedorDto } from './dtos/create.proveedor.dto';
import { UpdateProveedorDto } from './dtos/update.proveedor.dto';

@Injectable()
export class ProveedoresService {
    constructor(private prisma: PrismaService) {}

    /*
        La tabla del frontend necesita mostrar los rubros de cada proveedor, así
        que los traemos con include en la misma consulta (una sola ida a la base)
        y después aplanamos el resultado.

        Prisma devuelve rubros: [{ idProveedor, idRubro, rubro: {...} }] porque
        pasa por la tabla intermedia. El .map lo convierte en rubros: [{...}]
        para que el frontend reciba algo cómodo: proveedor.rubros[0].nombre.
    */
    async findAll() {
        const proveedores = await this.prisma.proveedor.findMany({
            orderBy: { nombre: 'asc' },
            include: { rubros: { include: { rubro: true } } },
        });

        return proveedores.map(({ rubros, ...proveedor }) => ({
            ...proveedor,
            rubros: rubros.map((fila) => fila.rubro),
        }));
    }

    async findOne(id: number) {
        const proveedor = await this.prisma.proveedor.findUnique({
            where: { id },
            include: { rubros: { include: { rubro: true } } },
        });

        if (!proveedor) return null;

        const { rubros, ...datosProveedor } = proveedor;
        return { ...datosProveedor, rubros: rubros.map((fila) => fila.rubro) };
    }

    // Proveedor.nombre tampoco es @unique, mismo criterio que en rubros.
    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const existente = await this.prisma.proveedor.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id: idIgnorado ? { not: idIgnorado } : undefined,
            },
        });

        if (existente) {
            throw new ConflictException('Ya existe un proveedor con ese nombre');
        }
    }

    // Traduce los errores de Prisma que sí dependen de constraints de la base.
    private manejarErrorPrisma(err: unknown): never {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new ConflictException('Ya existe un proveedor con ese email');
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
            throw new BadRequestException('Uno de los rubros indicados no existe');
        }
        throw err;
    }

    async create(data: CreateProveedorDto) {
        const { idsRubros, estado, ...datosProveedor } = data;

        await this.validarNombreDisponible(data.nombre);

        /*
            Transacción: el proveedor y sus rubros se guardan como un todo o nada.
            Si falla el createMany de rubros, el proveedor tampoco queda creado.
        */
        try {
            return await this.prisma.$transaction(async (tx) => {
                const proveedor = await tx.proveedor.create({
                    data: { ...datosProveedor, estado: estado ?? 'Activo' },
                });

                await tx.proveedorRubro.createMany({
                    data: idsRubros.map((idRubro) => ({ idProveedor: proveedor.id, idRubro })),
                });

                return proveedor;
            });
        } catch (err) {
            this.manejarErrorPrisma(err);
        }
    }

    async update(id: number, data: UpdateProveedorDto) {
        const { idsRubros, ...datosProveedor } = data;

        const proveedor = await this.findOne(id);
        if (!proveedor) {
            throw new NotFoundException('No existe el proveedor que intentás editar');
        }

        if (data.nombre) {
            await this.validarNombreDisponible(data.nombre, id);
        }

        try {
            return await this.prisma.$transaction(async (tx) => {
                const actualizado = await tx.proveedor.update({ where: { id }, data: datosProveedor });

                // Solo tocamos los rubros si el body los trajo (igual que los permisos de un perfil)
                if (idsRubros) {
                    await tx.proveedorRubro.deleteMany({ where: { idProveedor: id } });
                    await tx.proveedorRubro.createMany({
                        data: idsRubros.map((idRubro) => ({ idProveedor: id, idRubro })),
                    });
                }

                return actualizado;
            });
        } catch (err) {
            this.manejarErrorPrisma(err);
        }
    }

    async remove(id: number) {
        const proveedor = await this.findOne(id);
        if (!proveedor) {
            throw new NotFoundException('No existe el proveedor que intentás eliminar');
        }

        // Si ya se le cargó plata no se borra: sería borrar historia contable.
        const movimientos = await this.prisma.movimientoFinanciero.count({ where: { idProveedor: id } });
        if (movimientos !== 0) {
            throw new ConflictException(
                'No se puede eliminar: el proveedor tiene movimientos financieros registrados. Bloquealo en vez de eliminarlo',
            );
        }

        // Primero las filas de la tabla intermedia, si no la FK no deja borrar el proveedor.
        return this.prisma.$transaction(async (tx) => {
            await tx.proveedorRubro.deleteMany({ where: { idProveedor: id } });
            return tx.proveedor.delete({ where: { id } });
        });
    }
}
