-- Cuántos tickets salieron en cada entrega. Las que ya existían todavía no
-- tuvieron correcciones: su cantidad original es la de tickets que apuntan a ellas.
ALTER TABLE "entregas" ADD COLUMN "cantidadOriginal" INTEGER;

UPDATE "entregas" e
SET "cantidadOriginal" = (SELECT COUNT(*) FROM "tickets_evento" t WHERE t."idEntrega" = e."id");

ALTER TABLE "entregas" ALTER COLUMN "cantidadOriginal" SET NOT NULL;
