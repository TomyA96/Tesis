import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRubroDto } from './dtos/create.rubro.dto';
import { UpdateRubroDto } from './dtos/update.rubro.dto';
import { mismoNombre } from '../utils/texto';

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
        Prisma. Se compara sin mayúsculas ni tildes (mismoNombre): "Publicidad",
        "publicidad" y "Publicidád" cuentan como el mismo rubro. idIgnorado sirve para editar: al modificar el rubro 5
        no queremos que choque contra sí mismo.
    */
    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const otros = await this.prisma.rubro.findMany({
            where: { id: idIgnorado ? { not: idIgnorado } : undefined },
            select: { nombre: true },
        });

        if (otros.some((otro) => mismoNombre(otro.nombre, nombre))) {
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
        // Pasar a Mixto siempre se puede (admite los dos tipos); a Ingreso o Gasto, depende de lo que ya tiene
        if (data.tipo && data.tipo !== rubro.tipo && data.tipo !== 'Mixto') {
            await this.validarCambioDeTipo(id, data.tipo);
        }

        return this.prisma.rubro.update({ where: { id }, data });
    }

    /*
        Un proveedor solo trabaja en rubros de Gasto o Mixto, y una fuente en
        rubros de Ingreso o Mixto. Si el rubro pasa a ser solo de Ingreso, no
        puede tener proveedores ni gastos registrados; si pasa a ser solo de
        Gasto, no puede tener fuentes ni ingresos. Si no, quedarían datos que
        contradicen el tipo del rubro.
    */
    private async validarCambioDeTipo(id: number, tipo: 'Ingreso' | 'Gasto') {
        const [asociados, movimientos] = tipo === 'Ingreso'
            ? await Promise.all([
                this.prisma.proveedorRubro.findMany({ where: { idRubro: id }, select: { proveedor: { select: { nombre: true } } } })
                    .then((filas) => filas.map((f) => f.proveedor.nombre)),
                this.prisma.movimientoFinanciero.count({ where: { idRubro: id, tipoMovimiento: 'Gasto' } }),
            ])
            : await Promise.all([
                this.prisma.fuenteIngresoRubro.findMany({ where: { idRubro: id }, select: { fuente: { select: { nombre: true } } } })
                    .then((filas) => filas.map((f) => f.fuente.nombre)),
                this.prisma.movimientoFinanciero.count({ where: { idRubro: id, tipoMovimiento: 'Ingreso' } }),
            ]);

        const problemas: string[] = [];
        if (asociados.length > 0) {
            const quienes = tipo === 'Ingreso' ? ['proveedor asociado', 'proveedores asociados'] : ['fuente de ingreso asociada', 'fuentes de ingreso asociadas'];
            const nombres = asociados.slice(0, 3).join(', ') + (asociados.length > 3 ? ` y ${asociados.length - 3} más` : '');
            problemas.push(`${asociados.length} ${asociados.length === 1 ? quienes[0] : quienes[1]} (${nombres})`);
        }
        if (movimientos > 0) {
            const que = tipo === 'Ingreso' ? ['gasto registrado', 'gastos registrados'] : ['ingreso registrado', 'ingresos registrados'];
            problemas.push(`${movimientos} ${movimientos === 1 ? que[0] : que[1]}`);
        }
        if (problemas.length > 0) {
            throw new ConflictException(`No se puede pasar el rubro a ${tipo}: tiene ${problemas.join(' y ')}. Si necesita los dos tipos, pasalo a Mixto`);
        }
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

        const fuentes = await this.prisma.fuenteIngresoRubro.count({ where: { idRubro: id } });
        if (fuentes !== 0) {
            throw new ConflictException('No se puede eliminar: el rubro tiene fuentes de ingreso asociadas');
        }

        return this.prisma.rubro.delete({ where: { id } });
    }
}
