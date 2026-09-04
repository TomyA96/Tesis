/*
  Warnings:

  - Made the column `fechaHoraFin` on table `eventos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "eventos" ALTER COLUMN "fechaHoraFin" SET NOT NULL;
