ALTER TABLE "movimientos_financieros" RENAME COLUMN "fechaHora" TO "fecha";
ALTER TABLE "movimientos_financieros" ALTER COLUMN "fecha" TYPE DATE USING "fecha"::date;
