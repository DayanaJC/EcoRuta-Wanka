-- CreateEnum
CREATE TYPE "estado_parada" AS ENUM ('pendiente', 'entregada', 'no_entregada');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "fecha_entrega" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "ruta_paradas" ADD COLUMN     "dentro_ventana" BOOLEAN,
ADD COLUMN     "entregado_at" TIMESTAMPTZ(3),
ADD COLUMN     "estado" "estado_parada" NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "motivo_no_entrega" VARCHAR(200),
ADD COLUMN     "registrado_por" VARCHAR(20);

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "completada_at" TIMESTAMPTZ(3),
ADD COLUMN     "iniciada_at" TIMESTAMPTZ(3);

-- Datos existentes: las paradas cuyo pedido ya figura como entregado se marcan como entregadas
-- (sin hora real, que antes no se registraba)
UPDATE "ruta_paradas" rp SET "estado" = 'entregada', "registrado_por" = 'migracion'
FROM "pedidos" p, "rutas" r
WHERE rp."pedido_id" = p."id" AND rp."ruta_id" = r."id"
  AND p."estado" = 'entregado' AND r."estado" IN ('en_reparto', 'completada');
