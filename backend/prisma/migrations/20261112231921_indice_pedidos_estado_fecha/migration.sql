-- CreateIndex
CREATE INDEX "pedidos_estado_created_at_idx" ON "pedidos"("estado", "created_at" DESC);
