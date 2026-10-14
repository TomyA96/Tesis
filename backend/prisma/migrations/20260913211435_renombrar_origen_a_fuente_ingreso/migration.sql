-- CreateEnum
CREATE TYPE "EstadoFuenteIngreso" AS ENUM ('Activo', 'Bloqueado');

-- DropForeignKey
ALTER TABLE "movimientos_financieros" DROP CONSTRAINT "movimientos_financieros_idOrigen_fkey";

-- DropForeignKey
ALTER TABLE "origenes_ingreso_rubros" DROP CONSTRAINT "origenes_ingreso_rubros_idOrigen_fkey";

-- DropForeignKey
ALTER TABLE "origenes_ingreso_rubros" DROP CONSTRAINT "origenes_ingreso_rubros_idRubro_fkey";

-- AlterTable
ALTER TABLE "movimientos_financieros" DROP COLUMN "idOrigen",
ADD COLUMN     "idFuente" INTEGER;

-- DropTable
DROP TABLE "origenes_ingreso";

-- DropTable
DROP TABLE "origenes_ingreso_rubros";

-- DropEnum
DROP TYPE "EstadoOrigenIngreso";

-- CreateTable
CREATE TABLE "fuentes_ingreso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "estado" "EstadoFuenteIngreso" NOT NULL,

    CONSTRAINT "fuentes_ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuentes_ingreso_rubros" (
    "idFuente" INTEGER NOT NULL,
    "idRubro" INTEGER NOT NULL,

    CONSTRAINT "fuentes_ingreso_rubros_pkey" PRIMARY KEY ("idFuente","idRubro")
);

-- CreateIndex
CREATE UNIQUE INDEX "fuentes_ingreso_email_key" ON "fuentes_ingreso"("email");

-- AddForeignKey
ALTER TABLE "fuentes_ingreso_rubros" ADD CONSTRAINT "fuentes_ingreso_rubros_idFuente_fkey" FOREIGN KEY ("idFuente") REFERENCES "fuentes_ingreso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuentes_ingreso_rubros" ADD CONSTRAINT "fuentes_ingreso_rubros_idRubro_fkey" FOREIGN KEY ("idRubro") REFERENCES "rubros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_financieros" ADD CONSTRAINT "movimientos_financieros_idFuente_fkey" FOREIGN KEY ("idFuente") REFERENCES "fuentes_ingreso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

