/*
  Warnings:

  - You are about to drop the column `idEvento` on the `entradas` table. All the data in the column will be lost.
  - You are about to drop the column `capacidad` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `fechaHoraFin` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `fechaHoraInicio` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `idEvento` on the `ventas_buffet` table. All the data in the column will be lost.
  - Added the required column `idJornada` to the `entradas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idJornada` to the `ventas_buffet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "entradas" DROP CONSTRAINT "entradas_idEvento_fkey";

-- DropForeignKey
ALTER TABLE "ventas_buffet" DROP CONSTRAINT "ventas_buffet_idEvento_fkey";

-- AlterTable
ALTER TABLE "entradas" DROP COLUMN "idEvento",
ADD COLUMN     "idJornada" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "eventos" DROP COLUMN "capacidad",
DROP COLUMN "direccion",
DROP COLUMN "estado",
DROP COLUMN "fechaHoraFin",
DROP COLUMN "fechaHoraInicio",
DROP COLUMN "ubicacion";

-- AlterTable
ALTER TABLE "ventas_buffet" DROP COLUMN "idEvento",
ADD COLUMN     "idJornada" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "jornadas" (
    "id" SERIAL NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "nombre" TEXT,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'Borrador',

    CONSTRAINT "jornadas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_idJornada_fkey" FOREIGN KEY ("idJornada") REFERENCES "jornadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_buffet" ADD CONSTRAINT "ventas_buffet_idJornada_fkey" FOREIGN KEY ("idJornada") REFERENCES "jornadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
