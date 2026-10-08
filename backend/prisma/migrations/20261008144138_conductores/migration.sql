-- CreateEnum
CREATE TYPE "estado_conductor" AS ENUM ('activo', 'inactivo');

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "conductor_id" UUID;

-- CreateTable
CREATE TABLE "conductores" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "dni" VARCHAR(8) NOT NULL,
    "telefono" VARCHAR(15),
    "licencia" VARCHAR(15),
    "estado" "estado_conductor" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "conductores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conductores_dni_key" ON "conductores"("dni");

-- CreateIndex
CREATE INDEX "conductores_estado_idx" ON "conductores"("estado");

-- CreateIndex
CREATE INDEX "rutas_conductor_id_idx" ON "rutas"("conductor_id");

-- CreateIndex
CREATE INDEX "rutas_fecha_idx" ON "rutas"("fecha");

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "conductores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
