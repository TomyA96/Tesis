-- AlterTable
ALTER TABLE "perfiles" ADD COLUMN     "esAdministrador" BOOLEAN NOT NULL DEFAULT false;

-- El perfil Administrador que ya existe pasa a ser el del sistema
UPDATE "perfiles" SET "esAdministrador" = true WHERE "nombre" = 'Administrador';
