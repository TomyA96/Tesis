-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('Activo', 'Inactivo', 'Bloqueado');

-- CreateEnum
CREATE TYPE "TablaSistema" AS ENUM ('Usuarios', 'Perfiles', 'PerfilesPermisos', 'Eventos', 'Entradas', 'Proveedores', 'Productos', 'Reembolsos', 'Rubros', 'RubrosProveedores');

-- CreateEnum
CREATE TYPE "CanalVenta" AS ENUM ('Online', 'Fisico');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('Activo', 'Cancelado', 'Finalizado', 'Suspendido', 'Borrador');

-- CreateEnum
CREATE TYPE "EstadoEntrada" AS ENUM ('Disponible', 'Agotada', 'Borrador', 'Anulada');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('Disponible', 'Asignado', 'Vendido', 'Usado', 'Anulada', 'Reembolsada');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('Pendiente', 'Aprobada', 'Fallida', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoReembolso" AS ENUM ('Procesado', 'Pendiente', 'Rechazado');

-- CreateEnum
CREATE TYPE "EstadoPuntoVenta" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('Comida', 'Bebida');

-- CreateEnum
CREATE TYPE "EstadoProducto" AS ENUM ('Disponible', 'Descontinuado');

-- CreateEnum
CREATE TYPE "EstadoProveedor" AS ENUM ('Activo', 'Bloqueado');

-- CreateEnum
CREATE TYPE "TipoRubro" AS ENUM ('Ingreso', 'Gasto', 'Mixto');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('Ingreso', 'Gasto');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'Activo',
    "ultimoAcceso" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_perfiles" (
    "idUsuario" INTEGER NOT NULL,
    "idPerfil" INTEGER NOT NULL,

    CONSTRAINT "usuarios_perfiles_pkey" PRIMARY KEY ("idPerfil","idUsuario")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos_perfiles" (
    "idPermiso" INTEGER NOT NULL,
    "idPerfil" INTEGER NOT NULL,

    CONSTRAINT "permisos_perfiles_pkey" PRIMARY KEY ("idPerfil","idPermiso")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idRegistro" INTEGER NOT NULL,
    "tabla" "TablaSistema" NOT NULL,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),
    "ubicacion" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoEvento" NOT NULL,
    "direccion" TEXT,
    "capacidad" INTEGER NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entradas" (
    "id" SERIAL NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "esFisica" BOOLEAN NOT NULL,
    "estado" "EstadoEntrada" NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" SERIAL NOT NULL,
    "idCliente" INTEGER,
    "canal" "CanalVenta" NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoOrden" NOT NULL,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets_evento" (
    "id" SERIAL NOT NULL,
    "idEntrada" INTEGER NOT NULL,
    "idOrden" INTEGER,
    "idPuntoVenta" INTEGER,
    "codigoQR" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoTicket" NOT NULL,

    CONSTRAINT "tickets_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reembolsos" (
    "id" SERIAL NOT NULL,
    "idTicket" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoReembolso" NOT NULL,

    CONSTRAINT "reembolsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_venta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" "EstadoPuntoVenta" NOT NULL,

    CONSTRAINT "puntos_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accesos" (
    "id" SERIAL NOT NULL,
    "idTicket" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_evento" (
    "id" SERIAL NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "imagenes_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoProducto" NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_evento" (
    "idProducto" INTEGER NOT NULL,
    "idEvento" INTEGER NOT NULL,

    CONSTRAINT "productos_evento_pkey" PRIMARY KEY ("idProducto","idEvento")
);

-- CreateTable
CREATE TABLE "ventas_buffet" (
    "id" SERIAL NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ventas_buffet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_venta_buffet" (
    "idProducto" INTEGER NOT NULL,
    "idVentaBuffet" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detalle_venta_buffet_pkey" PRIMARY KEY ("idProducto","idVentaBuffet")
);

-- CreateTable
CREATE TABLE "rubros" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoRubro" NOT NULL,

    CONSTRAINT "rubros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "estado" "EstadoProveedor" NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores_rubros" (
    "idProveedor" INTEGER NOT NULL,
    "idRubro" INTEGER NOT NULL,

    CONSTRAINT "proveedores_rubros_pkey" PRIMARY KEY ("idProveedor","idRubro")
);

-- CreateTable
CREATE TABLE "movimientos_financieros" (
    "id" SERIAL NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "idRubro" INTEGER NOT NULL,
    "idProveedor" INTEGER,
    "nroFactura" TEXT,
    "tipoMovimiento" "TipoMovimiento" NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "movimientos_financieros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_evento_codigoQR_key" ON "tickets_evento"("codigoQR");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_evento_idEntrada_numero_key" ON "tickets_evento"("idEntrada", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "reembolsos_idTicket_key" ON "reembolsos"("idTicket");

-- CreateIndex
CREATE UNIQUE INDEX "accesos_idTicket_key" ON "accesos"("idTicket");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_email_key" ON "proveedores"("email");

-- AddForeignKey
ALTER TABLE "usuarios_perfiles" ADD CONSTRAINT "usuarios_perfiles_idPerfil_fkey" FOREIGN KEY ("idPerfil") REFERENCES "perfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_perfiles" ADD CONSTRAINT "usuarios_perfiles_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permisos_perfiles" ADD CONSTRAINT "permisos_perfiles_idPermiso_fkey" FOREIGN KEY ("idPermiso") REFERENCES "permisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permisos_perfiles" ADD CONSTRAINT "permisos_perfiles_idPerfil_fkey" FOREIGN KEY ("idPerfil") REFERENCES "perfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idEntrada_fkey" FOREIGN KEY ("idEntrada") REFERENCES "entradas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idOrden_fkey" FOREIGN KEY ("idOrden") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idPuntoVenta_fkey" FOREIGN KEY ("idPuntoVenta") REFERENCES "puntos_venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_idTicket_fkey" FOREIGN KEY ("idTicket") REFERENCES "tickets_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accesos" ADD CONSTRAINT "accesos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accesos" ADD CONSTRAINT "accesos_idTicket_fkey" FOREIGN KEY ("idTicket") REFERENCES "tickets_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_evento" ADD CONSTRAINT "imagenes_evento_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_evento" ADD CONSTRAINT "productos_evento_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_evento" ADD CONSTRAINT "productos_evento_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_buffet" ADD CONSTRAINT "ventas_buffet_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_buffet" ADD CONSTRAINT "ventas_buffet_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_venta_buffet" ADD CONSTRAINT "detalle_venta_buffet_idVentaBuffet_fkey" FOREIGN KEY ("idVentaBuffet") REFERENCES "ventas_buffet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_venta_buffet" ADD CONSTRAINT "detalle_venta_buffet_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores_rubros" ADD CONSTRAINT "proveedores_rubros_idProveedor_fkey" FOREIGN KEY ("idProveedor") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores_rubros" ADD CONSTRAINT "proveedores_rubros_idRubro_fkey" FOREIGN KEY ("idRubro") REFERENCES "rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_financieros" ADD CONSTRAINT "movimientos_financieros_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_financieros" ADD CONSTRAINT "movimientos_financieros_idRubro_fkey" FOREIGN KEY ("idRubro") REFERENCES "rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_financieros" ADD CONSTRAINT "movimientos_financieros_idProveedor_fkey" FOREIGN KEY ("idProveedor") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
