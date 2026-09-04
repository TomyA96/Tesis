-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTicket_new" AS ENUM ('Disponible', 'Impreso', 'Asignado', 'Vendido', 'Usado', 'Anulado', 'Reembolsado');
ALTER TABLE "tickets_evento" ALTER COLUMN "estado" TYPE "EstadoTicket_new" USING ("estado"::text::"EstadoTicket_new");
ALTER TYPE "EstadoTicket" RENAME TO "EstadoTicket_old";
ALTER TYPE "EstadoTicket_new" RENAME TO "EstadoTicket";
DROP TYPE "EstadoTicket_old";
COMMIT;
