-- CreateEnum
CREATE TYPE "EstadoOrigenIngreso" AS ENUM ('Activo', 'Bloqueado');

-- AlterTable
ALTER TABLE "movimientos_financieros" ADD COLUMN     "idOrigen" INTEGER;

-- CreateTable
CREATE TABLE "origenes_ingreso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "estado" "EstadoOrigenIngreso" NOT NULL,

    CONSTRAINT "origenes_ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origenes_ingreso_rubros" (
    "idOrigen" INTEGER NOT NULL,
    "idRubro" INTEGER NOT NULL,

    CONSTRAINT "origenes_ingreso_rubros_pkey" PRIMARY KEY ("idOrigen","idRubro")
);

-- CreateIndex
CREATE UNIQUE INDEX "origenes_ingreso_email_key" ON "origenes_ingreso"("email");

-- AddForeignKey
ALTER TABLE "origenes_ingreso_rubros" ADD CONSTRAINT "origenes_ingreso_rubros_idOrigen_fkey" FOREIGN KEY ("idOrigen") REFERENCES "origenes_ingreso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "origenes_ingreso_rubros" ADD CONSTRAINT "origenes_ingreso_rubros_idRubro_fkey" FOREIGN KEY ("idRubro") REFERENCES "rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_financieros" ADD CONSTRAINT "movimientos_financieros_idOrigen_fkey" FOREIGN KEY ("idOrigen") REFERENCES "origenes_ingreso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

