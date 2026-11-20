-- CreateEnum
CREATE TYPE "OrigenReembolso" AS ENUM ('Cancelacion', 'Presencial');

-- CreateEnum
CREATE TYPE "MedioDevolucion" AS ENUM ('MercadoPago', 'Efectivo', 'Transferencia');

-- DropForeignKey
ALTER TABLE "reembolsos" DROP CONSTRAINT "reembolsos_idUsuario_fkey";

-- AlterTable
ALTER TABLE "reembolsos" ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "fechaResolucion" TIMESTAMP(3),
ADD COLUMN     "idUsuarioRegistro" INTEGER,
ADD COLUMN     "medioDevolucion" "MedioDevolucion",
ADD COLUMN     "origen" "OrigenReembolso" NOT NULL DEFAULT 'Presencial',
ALTER COLUMN "idUsuario" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
