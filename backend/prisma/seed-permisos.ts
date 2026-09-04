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

    // Eventos
    { codigo: 'eventos.ver', descripcion: 'Ver eventos' },
    { codigo: 'eventos.crear', descripcion: 'Crear eventos' },
    { codigo: 'eventos.editar', descripcion: 'Editar eventos' },
    { codigo: 'eventos.eliminar', descripcion: 'Eliminar eventos' },
    { codigo: 'eventos.publicar', descripcion: 'Publicar eventos' },
    { codigo: 'eventos.concluir', descripcion: 'Finalizar, suspender o cancelar eventos' },

    // Entradas
    { codigo: 'entradas.ver', descripcion: 'Ver entradas' },
    { codigo: 'entradas.crear', descripcion: 'Crear entradas' },
    { codigo: 'entradas.editar', descripcion: 'Editar entradas' },
    { codigo: 'entradas.eliminar', descripcion: 'Eliminar entradas' },
    { codigo: 'entradas.publicar', descripcion: 'Publicar entradas' },
    { codigo: 'entradas.imprimir', descripcion: 'Generar tickets físicos' },

    // Rubros
    { codigo: 'rubros.ver', descripcion: 'Ver rubros' },
    { codigo: 'rubros.crear', descripcion: 'Crear rubros' },
    { codigo: 'rubros.editar', descripcion: 'Editar rubros' },
    { codigo: 'rubros.eliminar', descripcion: 'Eliminar rubros' },

    // Proveedores
    { codigo: 'proveedores.ver', descripcion: 'Ver proveedores' },
    { codigo: 'proveedores.crear', descripcion: 'Crear proveedores' },
    { codigo: 'proveedores.editar', descripcion: 'Editar proveedores' },
    { codigo: 'proveedores.eliminar', descripcion: 'Eliminar proveedores' },

    // Productos
    { codigo: 'productos.ver', descripcion: 'Ver productos' },
    { codigo: 'productos.crear', descripcion: 'Crear productos' },
    { codigo: 'productos.editar', descripcion: 'Editar productos' },
    { codigo: 'productos.eliminar', descripcion: 'Eliminar productos' },

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