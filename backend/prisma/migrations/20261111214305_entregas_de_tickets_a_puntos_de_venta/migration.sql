-- AlterTable
ALTER TABLE "tickets_evento" ADD COLUMN     "idEntrega" INTEGER;

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "idPuntoVenta" INTEGER NOT NULL,
    "idEvento" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idEntrega_fkey" FOREIGN KEY ("idEntrega") REFERENCES "entregas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_idPuntoVenta_fkey" FOREIGN KEY ("idPuntoVenta") REFERENCES "puntos_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
