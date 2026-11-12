-- AlterTable
ALTER TABLE "tickets_evento" ADD COLUMN     "idVendedor" INTEGER;

-- AddForeignKey
ALTER TABLE "tickets_evento" ADD CONSTRAINT "tickets_evento_idVendedor_fkey" FOREIGN KEY ("idVendedor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
