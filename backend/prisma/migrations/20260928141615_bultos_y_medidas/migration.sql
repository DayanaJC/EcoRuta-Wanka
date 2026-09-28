-- Bultos por pedido y medidas útiles de los vehículos (peso + volumen + dimensiones).

-- 1) Medidas útiles del vehículo: se agregan sin NOT NULL, se completan con
--    valores de referencia por tipo y luego se vuelven obligatorias.
ALTER TABLE "vehiculos"
  ADD COLUMN "largo_util_cm" DECIMAL(6,1),
  ADD COLUMN "ancho_util_cm" DECIMAL(6,1),
  ADD COLUMN "alto_util_cm" DECIMAL(6,1),
  ADD COLUMN "aprovechamiento_pct" SMALLINT NOT NULL DEFAULT 80;

-- Referencias (editables desde la aplicación):
--   moto: caja de reparto 45 x 45 x 40 cm
--   camioneta: tolva con toldo 220 x 150 x 120 cm
--   furgón: caja de carga 300 x 170 x 170 cm
UPDATE "vehiculos" SET "largo_util_cm" = 45,  "ancho_util_cm" = 45,  "alto_util_cm" = 40  WHERE "tipo" = 'moto';
UPDATE "vehiculos" SET "largo_util_cm" = 220, "ancho_util_cm" = 150, "alto_util_cm" = 120 WHERE "tipo" = 'camioneta';
UPDATE "vehiculos" SET "largo_util_cm" = 300, "ancho_util_cm" = 170, "alto_util_cm" = 170 WHERE "tipo" = 'furgon';

ALTER TABLE "vehiculos"
  ALTER COLUMN "largo_util_cm" SET NOT NULL,
  ALTER COLUMN "ancho_util_cm" SET NOT NULL,
  ALTER COLUMN "alto_util_cm" SET NOT NULL,
  ADD CONSTRAINT "vehiculos_medidas_positivas" CHECK ("largo_util_cm" > 0 AND "ancho_util_cm" > 0 AND "alto_util_cm" > 0),
  ADD CONSTRAINT "vehiculos_aprovechamiento_rango" CHECK ("aprovechamiento_pct" BETWEEN 30 AND 100);

-- 2) Bultos de cada pedido
CREATE TABLE "pedido_bultos" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,
    "cantidad" SMALLINT NOT NULL DEFAULT 1,
    "largo_cm" DECIMAL(6,1) NOT NULL,
    "ancho_cm" DECIMAL(6,1) NOT NULL,
    "alto_cm" DECIMAL(6,1) NOT NULL,
    "peso_kg" DECIMAL(8,2) NOT NULL,
    "apilable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pedido_bultos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pedido_bultos_valores_positivos" CHECK ("cantidad" > 0 AND "largo_cm" > 0 AND "ancho_cm" > 0 AND "alto_cm" > 0 AND "peso_kg" > 0)
);

CREATE INDEX "pedido_bultos_pedido_id_idx" ON "pedido_bultos"("pedido_id");

ALTER TABLE "pedido_bultos" ADD CONSTRAINT "pedido_bultos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3) Pedidos existentes: un bulto equivalente (cubo con su volumen y su peso)
INSERT INTO "pedido_bultos" ("id", "pedido_id", "descripcion", "cantidad", "largo_cm", "ancho_cm", "alto_cm", "peso_kg")
SELECT gen_random_uuid(), p."id", 'Carga general', 1,
       ROUND((CBRT(p."volumen_m3"::double precision) * 100)::numeric, 1), ROUND((CBRT(p."volumen_m3"::double precision) * 100)::numeric, 1), ROUND((CBRT(p."volumen_m3"::double precision) * 100)::numeric, 1),
       p."peso_kg"
FROM "pedidos" p;
