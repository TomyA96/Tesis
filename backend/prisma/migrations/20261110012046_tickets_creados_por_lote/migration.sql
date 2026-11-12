/*
  Los tickets de cada lote pasan a crearse todos juntos (al publicarlo o al
  imprimirlo), así que la cantidad del lote deja de ser opcional.
*/

-- AlterEnum
ALTER TYPE "EstadoEntrada" ADD VALUE 'Anulado';

-- AlterEnum
ALTER TYPE "EstadoTicket" ADD VALUE 'Disponible';
ALTER TYPE "EstadoTicket" ADD VALUE 'Reservado';

-- Los lotes viejos sin cantidad se quedan con los tickets que ya tienen
-- (en la base de desarrollo son todos de jornadas canceladas o finalizadas)
UPDATE "entradas" e
SET "cantidad" = (SELECT COUNT(*) FROM "tickets_evento" t WHERE t."idEntrada" = e."id")
WHERE e."cantidad" IS NULL;

-- AlterTable
ALTER TABLE "entradas" ALTER COLUMN "cantidad" SET NOT NULL;

-- Un lote físico ahora pasa a Disponible recién al imprimirse: los que se
-- habían publicado sin imprimir vuelven a Borrador
UPDATE "entradas" e
SET "estado" = 'Borrador'
WHERE e."esFisica" = true
  AND e."estado" = 'Disponible'
  AND NOT EXISTS (SELECT 1 FROM "tickets_evento" t WHERE t."idEntrada" = e."id");
