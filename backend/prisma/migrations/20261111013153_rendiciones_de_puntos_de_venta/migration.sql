-- CreateEnum
CREATE TYPE "TipoComision" AS ENUM ('Ninguna', 'Porcentaje', 'MontoFijo');

-- AlterTable
ALTER TABLE "tickets_evento" ADD COLUMN     "idRendicion" INTEGER;

-- CreateTable
CREATE TABLE "rendiciones" (
    "id" SERIAL NOT NULL,
    "idPuntoVenta" INTEGER NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cantidadVendidos" INTEGER NOT NULL,
    "cantidadDevueltos" INTEGER NOT NULL,
    "montoVendido" DECIMAL(65,30) NOT NULL,
    "tipoComision" "TipoComision" NOT NULL,
    "valorComision" DECIMAL(65,30),
    "montoComision" DECIMAL(65,30) NOT NULL,
    "saldoAnterior" DECIMAL(65,30) NOT NULL,
    "montoRecibido" DECIMAL(65,30) NOT NULL,
    "saldoPendiente" DECIMAL(65,30) NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "rendiciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idRendicion_fkey" FOREIGN KEY ("idRendicion") REFERENCES "rendiciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendiciones" ADD CONSTRAINT "rendiciones_idPuntoVenta_fkey" FOREIGN KEY ("idPuntoVenta") REFERENCES "puntos_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendiciones" ADD CONSTRAINT "rendiciones_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendiciones" ADD CONSTRAINT "rendiciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
