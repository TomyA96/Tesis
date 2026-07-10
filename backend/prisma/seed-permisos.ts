import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

// prisma/seed.ts
const permisos = [
    // Usuarios
    { codigo: 'usuarios.ver', descripcion: 'Ver usuarios' },
    { codigo: 'usuarios.crear', descripcion: 'Crear usuarios' },
    { codigo: 'usuarios.editar', descripcion: 'Editar usuarios' },
    { codigo: 'usuarios.eliminar', descripcion: 'Eliminar usuarios' },

    // Perfiles
    { codigo: 'perfiles.ver', descripcion: 'Ver perfiles' },
    { codigo: 'perfiles.crear', descripcion: 'Crear perfiles' },
    { codigo: 'perfiles.editar', descripcion: 'Editar perfiles' },
    { codigo: 'perfiles.eliminar', descripcion: 'Eliminar perfiles' },

] 

async function seedPermisos() {
  for (const permiso of permisos) {
    await prisma.permiso.upsert({
      where: {
        codigo: permiso.codigo,
      },
      update: {
        descripcion: permiso.descripcion,
      },
      create: {
        codigo: permiso.codigo,
        descripcion: permiso.descripcion,
      },
    });
  }
}

async function main() {
    await seedPermisos()
    console.log('Carga de permisos completada.')
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });