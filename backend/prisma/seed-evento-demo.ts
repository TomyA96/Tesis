import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const NOMBRE_EVENTO = 'Festival Demo'
const DIRECCION = 'Predio Ferial, Córdoba'
const CAPACIDAD = 500

const HORA = 60 * 60 * 1000
const DIA = 24 * HORA

// "AAAA-MM-DD" de un momento, en hora argentina (el locale sv-SE solo se usa por ese formato)
const diaArgentino = (fecha: Date) =>
    fecha.toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })

// Las 21:00 hora argentina de dentro de `dias` días
const nocheDentroDe = (dias: number) =>
    new Date(`${diaArgentino(new Date(Date.now() + dias * DIA))}T21:00:00-03:00`)

type EstadoEntrada = 'Disponible' | 'Borrador'

// Las entradas de cada jornada; solo cambia el estado según si la jornada ya se publicó
const entradasDe = (estado: EstadoEntrada) => [
    { descripcion: 'General', precio: 8000, esFisica: false, estado },
    { descripcion: 'VIP', precio: 15000, esFisica: false, cantidad: 100, estado },
    { descripcion: 'Puerta', precio: 9000, esFisica: true, cantidad: 200, estado },
]

async function main() {
    const existente = await prisma.evento.findFirst({
        where: { nombre: NOMBRE_EVENTO },
        include: { jornadas: true },
    })
    const ahora = Date.now()

    /*
        Cuatro jornadas para ver los distintos estados:
        - Día 1: en curso ahora (aparece como "de hoy" en Operaciones). La venta
          online ya cerró, como pasa en la vida real: se vende en la puerta.
        - Día 2 y 3: activas, con la venta online abierta.
        - Día 4: en borrador, sin publicar.
    */
    const jornadas = [
        {
            nombre: 'Día 1',
            fechaHoraInicio: new Date(ahora - 1 * HORA),
            fechaHoraFin: new Date(ahora + 5 * HORA),
            estado: 'Activo' as const,
        },
        {
            nombre: 'Día 2',
            fechaHoraInicio: nocheDentroDe(1),
            fechaHoraFin: new Date(nocheDentroDe(1).getTime() + 6 * HORA),
            estado: 'Activo' as const,
        },
        {
            nombre: 'Día 3',
            fechaHoraInicio: nocheDentroDe(2),
            fechaHoraFin: new Date(nocheDentroDe(2).getTime() + 6 * HORA),
            estado: 'Activo' as const,
        },
        {
            nombre: 'Día 4',
            fechaHoraInicio: nocheDentroDe(3),
            fechaHoraFin: new Date(nocheDentroDe(3).getTime() + 6 * HORA),
            estado: 'Borrador' as const,
        },
    ]

    /*
        Si el evento ya existe se lo deja como está y solo se corren las fechas de
        sus jornadas a partir de AHORA: es lo que hay que hacer cuando se vencen
        (una jornada se puede operar desde 2 h antes hasta 4 h después de su fin).
        No se tocan los estados ni las entradas: lo que hayas probado se conserva.
    */
    if (existente) {
        for (const jornada of existente.jornadas) {
            const nueva = jornadas.find((j) => j.nombre === jornada.nombre)
            if (!nueva) continue
            await prisma.jornada.update({
                where: { id: jornada.id },
                data: { fechaHoraInicio: nueva.fechaHoraInicio, fechaHoraFin: nueva.fechaHoraFin },
            })
        }
        const actualizadas = await prisma.jornada.findMany({
            where: { idEvento: existente.id },
            orderBy: { fechaHoraInicio: 'asc' },
        })
        console.log(`Ya existía "${NOMBRE_EVENTO}" (id ${existente.id}): se actualizaron las fechas de sus jornadas.`)
        for (const jornada of actualizadas) {
            console.log(`  - ${jornada.nombre} (id ${jornada.id}, ${jornada.estado}): ${jornada.fechaHoraInicio.toISOString()}`)
        }
        return
    }

    const evento = await prisma.evento.create({
        data: {
            nombre: NOMBRE_EVENTO,
            descripcion: 'Evento de prueba con varias jornadas, para trabajar y ver los cambios en el sistema.',
            estado: 'Activo',
            jornadas: {
                create: jornadas.map((jornada) => ({
                    ...jornada,
                    direccion: DIRECCION,
                    capacidad: CAPACIDAD,
                    entradas: {
                        create: entradasDe(jornada.estado === 'Activo' ? 'Disponible' : 'Borrador'),
                    },
                })),
            },
        },
        include: { jornadas: { orderBy: { fechaHoraInicio: 'asc' } } },
    })

    console.log(`Evento "${evento.nombre}" creado (id ${evento.id}) con ${evento.jornadas.length} jornadas:`)
    for (const jornada of evento.jornadas) {
        console.log(`  - ${jornada.nombre} (id ${jornada.id}, ${jornada.estado}): ${jornada.fechaHoraInicio.toISOString()}`)
    }
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
