/*
  Warnings:

  - The values [Agotada,Anulada] on the enum `EstadoEntrada` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoEntrada_new" AS ENUM ('Disponible', 'Borrador');
ALTER TABLE "public"."entradas" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "entradas" ALTER COLUMN "estado" TYPE "EstadoEntrada_new" USING ("estado"::text::"EstadoEntrada_new");
ALTER TYPE "EstadoEntrada" RENAME TO "EstadoEntrada_old";
ALTER TYPE "EstadoEntrada_new" RENAME TO "EstadoEntrada";
DROP TYPE "public"."EstadoEntrada_old";
ALTER TABLE "entradas" ALTER COLUMN "estado" SET DEFAULT 'Borrador';
COMMIT;

-- AlterTable
ALTER TABLE "entradas" ADD COLUMN     "habilitada" BOOLEAN NOT NULL DEFAULT true;
