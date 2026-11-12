/*
  Va en una migración aparte porque PostgreSQL no deja usar un valor de enum
  ('Disponible') en la misma transacción en la que se agregó.

  Los lotes online que ya estaban publicados en jornadas vigentes se crearon
  con el modelo anterior (tickets al vender): se les crean los tickets que
  les faltan para llegar a su cantidad, numerados a continuación de los que
  ya tenían.
*/
INSERT INTO "tickets_evento" ("idEntrada", "codigoQR", "numero", "precio", "estado")
SELECT e."id",
       gen_random_uuid()::text,
       n::text,
       e."precio",
       'Disponible'
FROM "entradas" e
JOIN "jornadas" j ON j."id" = e."idJornada"
CROSS JOIN LATERAL generate_series(
    (SELECT COUNT(*) FROM "tickets_evento" t WHERE t."idEntrada" = e."id") + 1,
    e."cantidad"
) AS n
WHERE e."esFisica" = false
  AND e."estado" = 'Disponible'
  AND j."estado" IN ('Activo', 'Suspendido');
