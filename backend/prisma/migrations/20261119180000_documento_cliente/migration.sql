-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "documento" VARCHAR(11);

-- CreateIndex
CREATE INDEX "clientes_documento_idx" ON "clientes"("documento");
