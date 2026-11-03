-- AlterTable
ALTER TABLE "eventos" ADD COLUMN     "estado" "EstadoEvento" NOT NULL DEFAULT 'Borrador';

-- Los eventos que ya existen conservan el estado que hoy se calcula desde sus jornadas.
-- Un evento solo usa Borrador, Activo y Finalizado: un evento con jornadas Activas o
-- Suspendidas sigue Activo, y uno con todas sus jornadas cerradas pasa a Finalizado.
UPDATE "eventos" SET "estado" = 'Activo'
WHERE EXISTS (
    SELECT 1 FROM "jornadas" WHERE "jornadas"."idEvento" = "eventos"."id" AND "jornadas"."estado" IN ('Activo', 'Suspendido')
);

UPDATE "eventos" SET "estado" = 'Finalizado'
WHERE "estado" = 'Borrador'
  AND EXISTS (SELECT 1 FROM "jornadas" WHERE "jornadas"."idEvento" = "eventos"."id")
  AND NOT EXISTS (
    SELECT 1 FROM "jornadas" WHERE "jornadas"."idEvento" = "eventos"."id" AND "jornadas"."estado" NOT IN ('Finalizado', 'Cancelado')
);
