/*
  Warnings:

  - The values [Anulada,Reembolsada] on the enum `EstadoTicket` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTicket_new" AS ENUM ('Disponible', 'Asignado', 'Vendido', 'Usado', 'Anulado', 'Reembolsado');
ALTER TABLE "tickets_evento" ALTER COLUMN "estado" TYPE "EstadoTicket_new" USING ("estado"::text::"EstadoTicket_new");
ALTER TYPE "EstadoTicket" RENAME TO "EstadoTicket_old";
ALTER TYPE "EstadoTicket_new" RENAME TO "EstadoTicket";
DROP TYPE "public"."EstadoTicket_old";
COMMIT;
