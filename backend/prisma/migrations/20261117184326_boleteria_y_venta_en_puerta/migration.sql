-- AlterTable
ALTER TABLE "entradas" ADD COLUMN     "esBoleteria" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tickets_evento" ADD COLUMN     "idVentaPuerta" INTEGER;

-- CreateTable
CREATE TABLE "ventas_puerta" (
    "id" SERIAL NOT NULL,
    "idJornada" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "medioPago" "MedioPagoBuffet" NOT NULL,
    "estado" "EstadoVentaBuffet" NOT NULL DEFAULT 'Registrada',
    "esSobreventa" BOOLEAN NOT NULL DEFAULT false,
    "idUsuarioAnulacion" INTEGER,
    "fechaAnulacion" TIMESTAMP(3),
    "reemisiones" INTEGER NOT NULL DEFAULT 0,
    "idUsuarioReemision" INTEGER,
    "fechaReemision" TIMESTAMP(3),

    CONSTRAINT "ventas_puerta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idVentaPuerta_fkey" FOREIGN KEY ("idVentaPuerta") REFERENCES "ventas_puerta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_puerta" ADD CONSTRAINT "ventas_puerta_idJornada_fkey" FOREIGN KEY ("idJornada") REFERENCES "jornadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_puerta" ADD CONSTRAINT "ventas_puerta_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_puerta" ADD CONSTRAINT "ventas_puerta_idUsuarioAnulacion_fkey" FOREIGN KEY ("idUsuarioAnulacion") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_puerta" ADD CONSTRAINT "ventas_puerta_idUsuarioReemision_fkey" FOREIGN KEY ("idUsuarioReemision") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
