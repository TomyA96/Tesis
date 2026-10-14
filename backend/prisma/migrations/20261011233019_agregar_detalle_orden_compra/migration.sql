-- CreateTable
CREATE TABLE "detalle_orden_compra" (
    "idOrden" INTEGER NOT NULL,
    "idEntrada" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detalle_orden_compra_pkey" PRIMARY KEY ("idOrden","idEntrada")
);

-- AddForeignKey
ALTER TABLE "detalle_orden_compra" ADD CONSTRAINT "detalle_orden_compra_idOrden_fkey" FOREIGN KEY ("idOrden") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_orden_compra" ADD CONSTRAINT "detalle_orden_compra_idEntrada_fkey" FOREIGN KEY ("idEntrada") REFERENCES "entradas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
