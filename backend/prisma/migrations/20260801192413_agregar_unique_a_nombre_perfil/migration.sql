/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `perfiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "perfiles_nombre_key" ON "perfiles"("nombre");
