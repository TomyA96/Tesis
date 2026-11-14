-- AlterTable
ALTER TABLE "ordenes_compra" ADD COLUMN     "idOrdenMercadoPago" TEXT,
ADD COLUMN     "urlPago" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_idOrdenMercadoPago_key" ON "ordenes_compra"("idOrdenMercadoPago");

