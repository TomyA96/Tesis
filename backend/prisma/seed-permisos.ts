import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, EstadoPuntoVenta } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

await prisma.permiso.createMany({
    data: [
        {id: 1, codigo: 'GESTIONAR_PUNTOS_VENTA', descripcion: 'Permiso para gestionar puntos de venta'},
        {id: 2, codigo: 'GESTIONAR_PRODUCTOS', descripcion: 'Permiso para gestionar productos'},
        {id: 3, codigo: 'GESTIONAR_USUARIOS', descripcion: 'Permiso para gestionar usuarios'},
        {id: 4, codigo: 'GESTIONAR_PERMISOS', descripcion: 'Permiso para gestionar permisos'},
        ]
})