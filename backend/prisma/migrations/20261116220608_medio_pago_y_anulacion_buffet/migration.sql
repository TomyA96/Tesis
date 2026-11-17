-- CreateEnum
CREATE TYPE "MedioPagoBuffet" AS ENUM ('Efectivo', 'Tarjeta', 'QR');

-- CreateEnum
CREATE TYPE "EstadoVentaBuffet" AS ENUM ('Registrada', 'Anulada');

-- AlterTable
ALTER TABLE "ventas_buffet" ADD COLUMN     "estado" "EstadoVentaBuffet" NOT NULL DEFAULT 'Registrada',
ADD COLUMN     "fechaAnulacion" TIMESTAMP(3),
ADD COLUMN     "idUsuarioAnulacion" INTEGER,
ADD COLUMN     "medioPago" "MedioPagoBuffet" NOT NULL DEFAULT 'Efectivo';

-- AddForeignKey
ALTER TABLE "ventas_buffet" ADD CONSTRAINT "ventas_buffet_idUsuarioAnulacion_fkey" FOREIGN KEY ("idUsuarioAnulacion") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
