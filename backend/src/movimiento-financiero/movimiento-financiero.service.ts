import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngresoDto } from './dtos/create.ingreso.dto';
import { CreateGastoDto } from './dtos/create.gasto.dto';
import { UpdateIngresoDto } from './dtos/update.ingreso.dto';
import { UpdateGastoDto } from './dtos/update.gasto.dto';


@Injectable()
export class MovimientoFinancieroService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.movimientoFinanciero.findMany();
    }

    findOne(id: number) {
        return this.prisma.movimientoFinanciero.findUnique({ where: { id } });
    }

    /*
        Se aplanan rubro y proveedor a su nombre (mismo criterio que ProveedoresService)
        para que la tabla del frontend los muestre sin pedir nada extra.
    */
    async findGastosPorEvento(idEvento: number) {
        const gastos = await this.prisma.movimientoFinanciero.findMany({
            where: { idEvento, tipoMovimiento: 'Gasto' },
            include: { rubro: true, proveedor: true },
            // id como desempate: fecha ya no tiene hora, dos movimientos del mismo día empatan
            orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        });

        return gastos.map(({ rubro, proveedor, ...gasto }) => ({
            ...gasto,
            rubro: rubro.nombre,
            proveedor: proveedor?.nombre ?? null,
        }));
    }

    async findIngresosPorEvento(idEvento: number) {
        const ingresos = await this.prisma.movimientoFinanciero.findMany({
            where: { idEvento, tipoMovimiento: 'Ingreso' },
            include: { rubro: true, fuente: true },
            // id como desempate: fecha ya no tiene hora, dos movimientos del mismo día empatan
            orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        });

        return ingresos.map(({ rubro, fuente, ...ingreso }) => ({
            ...ingreso,
            rubro: rubro.nombre,
            fuente: fuente?.nombre ?? null,
        }));
    }

    async createIngreso(data: CreateIngresoDto) {
        await this.validarEvento(data.idEvento);
        await this.validarRubro(data.idRubro, 'Ingreso');
        await this.validarFuente(data.idFuente, data.idRubro);

        return this.prisma.movimientoFinanciero.create({ data: {...data, tipoMovimiento: 'Ingreso'}});
    }

    async createGasto(data: CreateGastoDto) {
        await this.validarEvento(data.idEvento);
        await this.validarRubro(data.idRubro, 'Gasto');
        await this.validarProveedor(data.idProveedor, data.idRubro);

        return this.prisma.movimientoFinanciero.create({ data: { ...data, tipoMovimiento: 'Gasto' } });
    }

    /*
        Se combina lo que llega con lo que ya estaba guardado y se valida la
        combinación final. Rubro y fuente solo se revalidan si cambian: lo que no
        se toca no se vuelve a juzgar con las reglas de hoy (ej: una fuente que
        después se bloqueó no impide corregir el monto de un ingreso viejo).
    */
    async updateIngreso(id: number, data: UpdateIngresoDto) {
        const actual = await this.buscarMovimiento(id, 'Ingreso');

        const idRubroFinal = data.idRubro ?? actual.idRubro;
        const idFuenteFinal = data.idFuente ?? actual.idFuente;
        const cambioRubro = idRubroFinal !== actual.idRubro;
        const cambioFuente = idFuenteFinal !== actual.idFuente;

        if (cambioRubro) {
            await this.validarRubro(idRubroFinal, 'Ingreso');
        }
        // Ingresos cargados antes de que existieran las fuentes: al editarlos se exige completarla
        if (idFuenteFinal === null) {
            throw new BadRequestException('El ingreso no tiene fuente asignada: indicá una para poder guardarlo');
        }
        if (cambioRubro || cambioFuente) {
            await this.validarFuente(idFuenteFinal, idRubroFinal);
        }

        return this.prisma.movimientoFinanciero.update({ where: { id }, data });
    }

    async updateGasto(id: number, data: UpdateGastoDto) {
        const actual = await this.buscarMovimiento(id, 'Gasto');

        const idRubroFinal = data.idRubro ?? actual.idRubro;
        const idProveedorFinal = data.idProveedor ?? actual.idProveedor;
        const cambioRubro = idRubroFinal !== actual.idRubro;
        const cambioProveedor = idProveedorFinal !== actual.idProveedor;

        if (cambioRubro) {
            await this.validarRubro(idRubroFinal, 'Gasto');
        }
        if (idProveedorFinal === null) {
            throw new BadRequestException('El gasto no tiene proveedor asignado: indicá uno para poder guardarlo');
        }
        if (cambioRubro || cambioProveedor) {
            await this.validarProveedor(idProveedorFinal, idRubroFinal);
        }

        return this.prisma.movimientoFinanciero.update({ where: { id }, data });
    }

    async deleteIngreso(id: number) {
        await this.buscarMovimiento(id, 'Ingreso');
        return this.prisma.movimientoFinanciero.delete({ where: { id } });
    }

    async deleteGasto(id: number) {
        await this.buscarMovimiento(id, 'Gasto');
        return this.prisma.movimientoFinanciero.delete({ where: { id } });
    }

    // Chequear el tipo evita que, por ejemplo, la ruta de gastos borre un ingreso
    private async buscarMovimiento(id: number, tipo: TipoMovimiento) {
        const movimiento = await this.prisma.movimientoFinanciero.findUnique({ where: { id } });
        if (!movimiento || movimiento.tipoMovimiento !== tipo) {
            throw new NotFoundException(`No existe el ${tipo.toLowerCase()} indicado`);
        }
        return movimiento;
    }

    private async validarEvento(idEvento: number) {
        const evento = await this.prisma.evento.findUnique({ where: { id: idEvento } });
        if (!evento) {
            throw new NotFoundException('El evento indicado no existe');
        }
        if (evento.estado === 'Borrador') {
            throw new ConflictException('No se pueden registrar movimientos en un evento en borrador');
        }
        
    }

    private async validarRubro(idRubro: number, tipo: TipoMovimiento) {
        const rubro = await this.prisma.rubro.findUnique({ where: { id: idRubro } });
        if (!rubro) {
            throw new NotFoundException('El rubro indicado no existe');
        }
        // Un rubro Mixto admite los dos tipos; el resto solo el suyo.
        if (rubro.tipo !== 'Mixto' && rubro.tipo !== tipo) {
            throw new ConflictException(`El rubro ${rubro.nombre} no admite movimientos de tipo ${tipo}`);
        }
    }

    // Se trae solo la fila de la tabla intermedia del rubro elegido: si viene vacía, no están asociados.
    private async validarFuente(idFuente: number, idRubro: number) {
        const fuente = await this.prisma.fuenteIngreso.findUnique({
            where: { id: idFuente },
            include: { rubros: { where: { idRubro } } },
        });
        if (!fuente) {
            throw new NotFoundException('La fuente de ingreso indicada no existe');
        }
        if (fuente.estado === 'Bloqueado') {
            throw new ConflictException('No se puede asignar una fuente de ingreso bloqueada');
        }
        if (fuente.rubros.length === 0) {
            throw new ConflictException('La fuente no está asociada al rubro seleccionado');
        }
    }

    private async validarProveedor(idProveedor: number, idRubro: number) {
        const proveedor = await this.prisma.proveedor.findUnique({
            where: { id: idProveedor },
            include: { rubros: { where: { idRubro } } },
        });
        if (!proveedor) {
            throw new NotFoundException('El proveedor indicado no existe');
        }
        if (proveedor.estado === 'Bloqueado') {
            throw new ConflictException('No se puede asignar un proveedor bloqueado');
        }
        if (proveedor.rubros.length === 0) {
            throw new ConflictException('El proveedor no trabaja en el rubro seleccionado');
        }
    }
}
