import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJornadaDto } from './dtos/create.jornada.dto';
import { UpdateJornadaDto } from './dtos/update.jornada.dto';
import { ReprogramarJornadaDto } from './dtos/reprogramar.jornada.dto';
import { hallarSuperposiciones, seSuperponen, type Tramo } from './utils/superposicion';
import { faltantesParaPublicar } from './utils/publicacion';
import { anularTicketsSinVender, lugaresOcupados, publicarLoteOnline } from '../entradas/utils/tickets';

// Una jornada en Borrador y lo que le falta para publicarse (vacío = está completa)
export type RevisionJornada = {
    id: number;
    nombre: string | null;
    fechaHoraInicio: Date;
    faltantes: string[];
    // Su única entrada es la boletería: se publica, pero solo va a haber venta en puerta
    soloBoleteria: boolean;
};

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

    // Una jornada nueva (o con fecha nueva) no puede empezar en el pasado
    private validarInicioFuturo(inicio: Date) {
        if (inicio <= new Date()) {
            throw new BadRequestException('La fecha de inicio debe ser posterior a la fecha actual');
        }
    }

    /*
        Reglas de fechas para jornadas que se están CREANDO juntas (las que vienen
        con un evento nuevo): fin posterior al inicio, inicio futuro y que no se
        pisen entre ellas. Es público porque lo usa también EventosService.
    */
    validarFechasNuevas(jornadas: Tramo[]) {
        for (const jornada of jornadas) {
            this.validarFechas(jornada.fechaHoraInicio, jornada.fechaHoraFin);
            this.validarInicioFuturo(jornada.fechaHoraInicio);
        }
        if (hallarSuperposiciones(jornadas).length > 0) {
            throw new BadRequestException('Hay jornadas que se superponen en el tiempo');
        }
    }

    /*
        Compara uno o más tramos contra las jornadas ya guardadas del evento
        (las guardadas se traen una sola vez). Una cancelada no cuenta: ya no
        va a suceder, así que su horario queda libre. `excluirId` es para
        cuando se mueve una jornada que ya existe: no debe chocar consigo misma.
    */
    private async validarSinSuperposicion(idEvento: number, tramos: Tramo[], excluirId?: number) {
        const otras = await this.prisma.jornada.findMany({
            where: {
                idEvento,
                estado: { not: 'Cancelado' },
                // undefined hace que Prisma ignore la condición
                id: excluirId === undefined ? undefined : { not: excluirId },
            },
            select: { fechaHoraInicio: true, fechaHoraFin: true },
        });
        if (tramos.some((tramo) => otras.some((otra) => seSuperponen(tramo, otra)))) {
            throw new ConflictException('La jornada se superpone con otra jornada del evento');
        }
    }

    // Las jornadas solo se agregan a un evento que existe y no está finalizado
    private async validarEventoAbierto(idEvento: number) {
        const evento = await this.prisma.evento.findUnique({ where: { id: idEvento } });
        if (!evento) {
            throw new NotFoundException('No existe el evento al que intentas agregar la jornada');
        }
        if (evento.estado === 'Finalizado') {
            throw new ConflictException('No se pueden agregar jornadas a un evento finalizado');
        }
    }

    async create(idEvento: number, data: CreateJornadaDto) {
        // Mientras el evento no se finalice, se le pueden seguir sumando jornadas
        await this.validarEventoAbierto(idEvento);
        this.validarFechas(data.fechaHoraInicio, data.fechaHoraFin);
        this.validarInicioFuturo(data.fechaHoraInicio);
        await this.validarSinSuperposicion(idEvento, [data]);

        return this.prisma.jornada.create({ data: { ...data, idEvento } });
    }

    /*
        Agrega varias jornadas a un evento ya creado (las del generador).
        Mismas reglas que una sola, más que las nuevas no se pisen entre sí.
        Se crean en una transacción: todas o ninguna, así un error a la mitad
        no deja el evento con un lote cargado a medias.
    */
    async createVarias(idEvento: number, jornadas: CreateJornadaDto[]) {
        await this.validarEventoAbierto(idEvento);
        // Fin posterior, inicio futuro y sin superposición entre las nuevas
        this.validarFechasNuevas(jornadas);
        // ...y ninguna nueva se pisa con las que el evento ya tenía
        await this.validarSinSuperposicion(idEvento, jornadas);

        return this.prisma.$transaction(
            jornadas.map((jornada) => this.prisma.jornada.create({ data: { ...jornada, idEvento } }))
        );
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
        const inicio = data.fechaHoraInicio ?? jornada.fechaHoraInicio;
        const fin = data.fechaHoraFin ?? jornada.fechaHoraFin;
        this.validarFechas(inicio, fin);

        // Solo se exige inicio futuro si la están moviendo: editar otro campo de una jornada ya vieja no debe fallar
        if (data.fechaHoraInicio) {
            this.validarInicioFuturo(data.fechaHoraInicio);
        }
        if (data.fechaHoraInicio || data.fechaHoraFin) {
            await this.validarSinSuperposicion(jornada.idEvento, [{ fechaHoraInicio: inicio, fechaHoraFin: fin }], id);
        }
        /*
            La capacidad no puede quedar por debajo de los lugares ya
            comprometidos por sus lotes: si no, la jornada tendría más tickets
            que lugares. Los tickets anulados no cuentan.
        */
        if (data.capacidad !== undefined) {
            const ocupados = (await lugaresOcupados(this.prisma, [id])).get(id) ?? 0;
            if (data.capacidad < ocupados) {
                throw new ConflictException(`La capacidad no puede ser menor a las ${ocupados} entradas ya asignadas a la jornada`);
            }
        }

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

    /*
        Revisa todas las jornadas en Borrador del evento y dice qué le falta a
        cada una para publicarse. Una sola consulta: de las entradas solo se
        trae si son de la boletería (para avisar si es lo único que tiene).
        La boletería cuenta como entrada: una jornada que solo vende en la
        puerta se puede publicar.

        Las canceladas no cuentan para "hay varias": ya no van a suceder, así
        que no hace falta distinguirse de ellas.
    */
    async revisarPublicacion(idEvento: number): Promise<RevisionJornada[]> {
        const jornadas = await this.prisma.jornada.findMany({
            where: { idEvento, estado: { not: 'Cancelado' } },
            orderBy: { fechaHoraInicio: 'asc' },
            include: { entradas: { where: { habilitada: true }, select: { esBoleteria: true } } },
        });
        const hayVarias = jornadas.length > 1;

        return jornadas
            .filter((jornada) => jornada.estado === 'Borrador')
            .map((jornada) => ({
                id: jornada.id,
                nombre: jornada.nombre,
                fechaHoraInicio: jornada.fechaHoraInicio,
                faltantes: faltantesParaPublicar(
                    { ...jornada, entradasHabilitadas: jornada.entradas.length },
                    hayVarias
                ),
                soloBoleteria: jornada.entradas.length > 0 && jornada.entradas.every((e) => e.esBoleteria),
            }));
    }

    /*
        El cambio de estado en sí: la jornada pasa a Activo y sus lotes ONLINE
        se publican (con todos sus tickets creados, a la venta). Los físicos
        quedan en Borrador hasta que se impriman, y la boletería no se toca:
        sus tickets se crean al vender en la puerta. Recibe la transacción de
        quien llama, así publicar una jornada sola y publicar varias junto con
        el evento usan exactamente el mismo paso. No valida nada: eso lo hace
        quien llama.
    */
    async publicarEnTransaccion(tx: Prisma.TransactionClient, id: number) {
        const lotesOnline = await tx.entrada.findMany({
            where: { idJornada: id, estado: 'Borrador', habilitada: true, esFisica: false, esBoleteria: false },
        });
        for (const lote of lotesOnline) {
            await publicarLoteOnline(tx, lote);
        }
        return tx.jornada.update({ where: { id }, data: { estado: 'Activo' } });
    }

    async publicar(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Borrador') {
            throw new ConflictException('Solo se pueden publicar jornadas que estén en estado Borrador');
        }
        // Una jornada suelta solo se publica dentro de un evento ya publicado
        const evento = await this.prisma.evento.findUnique({ where: { id: jornada.idEvento } });
        if (evento?.estado !== 'Activo') {
            throw new ConflictException('Publicá el evento antes de publicar sus jornadas');
        }
        // La imagen es del evento completo, no de cada jornada
        const imagenes = await this.prisma.imagenEvento.count({ where: { idEvento: jornada.idEvento } });
        if (imagenes === 0) {
            throw new ConflictException('No se puede publicar una jornada si el evento no tiene una imagen publicitaria');
        }

        const revision = await this.revisarPublicacion(jornada.idEvento);
        const faltantes = revision.find((r) => r.id === id)?.faltantes ?? [];
        if (faltantes.length > 0) {
            throw new ConflictException(`No se puede publicar la jornada: ${faltantes.join('. ')}`);
        }

        return this.prisma.$transaction((tx) => this.publicarEnTransaccion(tx, id));
    }

    async cancelar(id: number) {
        const jornada = await this.findOne(id);

        if (jornada.estado !== 'Activo' && jornada.estado !== 'Suspendido') {
            throw new ConflictException('No es posible cancelar esta jornada');
        }
        /*
            Una jornada que ya empezó no se cancela: se hizo, aunque sea en
            parte. Si hay que cortarla (lluvia, un corte de luz) se suspende,
            y recién suspendida se decide: reprogramar, cancelar o finalizar.
        */
        if (jornada.estado === 'Activo' && jornada.fechaHoraInicio <= new Date()) {
            throw new ConflictException('La jornada ya empezó: no se puede cancelar. Suspendela o finalizala');
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
            /*
                La jornada no se va a hacer: se anula lo que no se vendió online
                y lo que está en mano. Lo asignado a locales queda pendiente de
                su rendición (pudieron haber vendido algunos).
            */
            await anularTicketsSinVender(tx, [id]);
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

        /*
            Finalizar es "ya se hizo". Una suspendida también se puede
            finalizar si había llegado a empezar: por ejemplo, se suspendió
            por lluvia una hora antes del cierre y no se va a retomar. Mientras
            está suspendida conserva sus fechas originales, así que "empezó"
            se sabe por su hora de inicio.
        */
        if (jornada.estado !== 'Activo' && jornada.estado !== 'Suspendido') {
            throw new ConflictException('No es posible finalizar esta jornada');
        }
        if (jornada.fechaHoraInicio > new Date()) {
            throw new ConflictException(jornada.estado === 'Suspendido'
                ? 'La jornada se suspendió antes de empezar: reprogramala o cancelala'
                : 'La jornada todavía no empezó: si no se va a realizar, suspendela o cancelala');
        }
        // Mismo criterio que cancelar — ver el comentario ahí.
        return this.prisma.$transaction(async (tx) => {
            await tx.entrada.deleteMany({
                where: { idJornada: id, estado: 'Borrador', tickets: { none: {} } }
            });
            /*
                Lo que no se vendió online y los físicos que quedaron en mano
                se anulan. Los asignados a locales se resuelven en la rendición
                con cada punto de venta.
            */
            await anularTicketsSinVender(tx, [id]);
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
        await this.validarSinSuperposicion(jornada.idEvento, [data], id);

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
