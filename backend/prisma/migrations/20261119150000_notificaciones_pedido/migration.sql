-- CreateEnum
CREATE TYPE "evento_notificacion" AS ENUM ('pedido_creado', 'en_camino', 'entregado', 'no_entregado');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "token_seguimiento" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "notificaciones_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "evento" "evento_notificacion" NOT NULL,
    "canal" VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    "telefono" VARCHAR(15),
    "mensaje" VARCHAR(500) NOT NULL,
    "fecha" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificaciones_pedido_pedido_id_fecha_idx" ON "notificaciones_pedido"("pedido_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_token_seguimiento_key" ON "pedidos"("token_seguimiento");

-- AddForeignKey
ALTER TABLE "notificaciones_pedido" ADD CONSTRAINT "notificaciones_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
