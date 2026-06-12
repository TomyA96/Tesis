import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, EstadoPuntoVenta } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main2() {
    const puntoVenta = await prisma.puntoVenta.create({
        data: {
            nombre: 'Punto de venta de prueba',
            telefono: '123456789',
            estado: EstadoPuntoVenta.Activo
        }
    })
    console.log('Punto de venta creado:', puntoVenta)
}

async function main3() {
    const puntoVenta = await prisma.puntoVenta.findMany()
    console.log('Puntos de venta encontrados:', puntoVenta)
}

async function main4() {
    const primerPuntoVenta = await prisma.puntoVenta.findMany({
        where: {nombre: {contains: 'prueba'}}
    })
    console.log('Primer punto de venta encontrado:', primerPuntoVenta)}

async function main5() {
    const punto = await prisma.puntoVenta.update({
        where: { id: 1 },
        data:{
            nombre: 'Punto de venta actualizado',
            estado: EstadoPuntoVenta.Inactivo
        }
    })}

async function main6() {
    const punto = await prisma.puntoVenta.delete({
        where: { id: 10 }
    })
    console.log('Punto de venta eliminado:', punto)
}

async function main() {
    const puntos = await prisma.puntoVenta.deleteMany({
        where: { estado: EstadoPuntoVenta.Inactivo }
    })
    console.log('Puntos de venta eliminados:', puntos.count, puntos)
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
