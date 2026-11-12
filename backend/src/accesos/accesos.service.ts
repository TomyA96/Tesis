import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoTicket, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccesoDto } from './dtos/create.acceso.dto';
import { CreateAccesoManualDto } from './dtos/create.acceso-manual.dto';
import { estaOperable } from '../jornadas/utils/ventana-operacion';

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

/*
    Escaneo del QR: entran Impreso, Asignado y Vendido. Impreso y Asignado entran
    porque la venta puede no estar registrada todavía (el local externo aún no
    rindió cuentas, o se perdió un registro): quien tiene el papel con un QR
    válido lo tiene físicamente, y rechazar a quien pagó no lo resuelve el
    portero. Esos casos se detectan después, por conciliación (ticket Usado sin
    vendedor, sin orden y sin punto de venta).
*/
const ESTADOS_ESCANEO: EstadoTicket[] = ['Impreso', 'Asignado', 'Vendido'];

/*
    Ingreso manual: más estricto. Sin el QR no hay prueba de que se tenga el
    ticket, y el número impreso es adivinable (1, 2, 3...), así que se exige que
    el sistema ya muestre una venta: Vendido, o Asignado (se entregó a un local
    externo que lo vende). Un ticket Impreso nunca salió de la organización.
*/
const ESTADOS_MANUAL: EstadoTicket[] = ['Asignado', 'Vendido'];

const INCLUIR_TICKET = {
    entrada: { include: { jornada: true } },
    accesos: { include: { usuario: { select: { nombre: true } } } },
} satisfies Prisma.TicketEventoInclude;

type TicketConRelaciones = Prisma.TicketEventoGetPayload<{ include: typeof INCLUIR_TICKET }>;

const hora = (fecha: Date) =>
    fecha.toLocaleTimeString('es-AR', { timeZone: ZONA_ARGENTINA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

const dia = (fecha: Date) => fecha.toLocaleDateString('es-AR', { timeZone: ZONA_ARGENTINA });

@Injectable()
export class AccesosService {
    constructor(private prisma: PrismaService) {}

    // Los últimos ingresos de una jornada, para mostrar en la pantalla de accesos
    findByJornada(idJornada: number) {
        return this.prisma.acceso.findMany({
            where: { ticket: { entrada: { idJornada } } },
            include: {
                ticket: { select: { numero: true, entrada: { select: { descripcion: true } } } },
                usuario: { select: { nombre: true } },
            },
            orderBy: { fechaHora: 'desc' },
            take: 100,
        });
    }

    // Ingreso normal: el ticket se identifica por el código del QR
    async registrarAccesoPorQR(idJornada: number, data: CreateAccesoDto, idUsuario: number) {
        await this.validarJornadaOperable(idJornada);

        const ticket = await this.prisma.ticketEvento.findUnique({
            where: { codigoQR: data.codigoQR },
            include: INCLUIR_TICKET,
        });

        return this.guardarAcceso({
            idJornada,
            ticket,
            idUsuario,
            estadosValidos: ESTADOS_ESCANEO,
            mensajeNoExiste: 'No existe un ticket con ese código',
        });
    }

    /*
        Ingreso manual (supervisores): el ticket se identifica por lote y número
        impreso, porque el QR no se puede leer.

        TODO: PermissionsGuard con un permiso propio (por ejemplo 'accesos.manual'),
        solo para supervisores, y dejar registrado en el Acceso que fue manual y el motivo.
    */
    async registrarAccesoManual(idJornada: number, data: CreateAccesoManualDto, idUsuario: number) {
        await this.validarJornadaOperable(idJornada);

        const ticket = await this.prisma.ticketEvento.findUnique({
            where: { idEntrada_numero: { idEntrada: data.idEntrada, numero: data.numero } },
            include: INCLUIR_TICKET,
        });

        return this.guardarAcceso({
            idJornada,
            ticket,
            idUsuario,
            estadosValidos: ESTADOS_MANUAL,
            mensajeNoExiste: 'No existe ese número de ticket en el lote indicado',
        });
    }

    private async validarJornadaOperable(idJornada: number) {
        const jornada = await this.prisma.jornada.findUnique({ where: { id: idJornada } });
        if (!jornada) {
            throw new NotFoundException('La jornada no existe');
        }
        if (!estaOperable(jornada)) {
            throw new ConflictException(
                jornada.estado === 'Activo'
                    ? 'La jornada no está habilitada para registrar ingresos en este horario'
                    : `La jornada no está habilitada para registrar ingresos (estado: ${jornada.estado})`,
            );
        }
    }

    /*
        Lo que comparten los dos caminos: valida el ticket encontrado y registra el
        ingreso. Solo cambian cómo se lo busca y qué estados se aceptan.
    */
    private async guardarAcceso(opciones: {
        idJornada: number;
        ticket: TicketConRelaciones | null;
        idUsuario: number;
        estadosValidos: EstadoTicket[];
        mensajeNoExiste: string;
    }) {
        const { idJornada, ticket, idUsuario, estadosValidos, mensajeNoExiste } = opciones;

        if (!ticket) {
            throw new NotFoundException(mensajeNoExiste);
        }
        if (ticket.entrada.idJornada !== idJornada) {
            const otra = ticket.entrada.jornada;
            throw new ConflictException(
                `Este ticket es de otra jornada: ${otra.nombre ?? `#${otra.id}`} (${dia(otra.fechaHoraInicio)})`,
            );
        }
        if (ticket.accesos) {
            throw new ConflictException(
                `Este ticket ya ingresó a las ${hora(ticket.accesos.fechaHora)} (registrado por ${ticket.accesos.usuario.nombre})`,
            );
        }
        if (ticket.estado === 'Anulado') {
            throw new ConflictException('Este ticket está anulado');
        }
        if (ticket.estado === 'Reembolsado') {
            throw new ConflictException('Este ticket fue reembolsado');
        }
        if (!estadosValidos.includes(ticket.estado)) {
            throw new ConflictException('Este ticket no figura como vendido: no se puede registrar el ingreso de esta forma');
        }

        try {
            const acceso = await this.prisma.$transaction(async (tx) => {
                /*
                    Marcar el ticket como Usado es el candado: la condición sobre el estado hace
                    que, si dos escáneres leen el mismo QR a la vez, solo uno lo consiga.
                */
                const marcado = await tx.ticketEvento.updateMany({
                    where: { id: ticket.id, estado: { in: estadosValidos } },
                    data: { estado: 'Usado' },
                });
                if (marcado.count === 0) {
                    throw new ConflictException('Este ticket ya no es válido para ingresar');
                }
                return tx.acceso.create({ data: { idTicket: ticket.id, idUsuario } });
            });

            return {
                acceso,
                ticket: { id: ticket.id, numero: ticket.numero, entrada: ticket.entrada.descripcion },
                // Para que la pantalla lo muestre en amarillo: entra igual, pero la venta no quedó registrada
                advertencia: ticket.estado === 'Impreso' ? 'Ticket sin venta registrada' : null,
            };
        } catch (err) {
            // Red de seguridad: Acceso.idTicket es único, así que un doble ingreso nunca se guarda
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new ConflictException('Este ticket ya ingresó');
            }
            throw err;
        }
    }
}
