-- CreateEnum
CREATE TYPE "tipo_cliente" AS ENUM ('bodega', 'minimarket', 'restaurante', 'farmacia', 'otro');

-- CreateEnum
CREATE TYPE "estado_cliente" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "tipo_incidente" AS ENUM ('trafico_intenso', 'via_bloqueada', 'accidente', 'lluvia', 'retraso_vehiculo', 'otro');

-- CreateEnum
CREATE TYPE "resultado_incidente" AS ENUM ('reoptimizada', 'sin_cambios');

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "hora_replanificacion" TIME(0),
ADD COLUMN     "reoptimizada_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" "tipo_cliente" NOT NULL DEFAULT 'bodega',
    "telefono" VARCHAR(15),
    "direccion" VARCHAR(200) NOT NULL,
    "punto_referencia" VARCHAR(200) NOT NULL DEFAULT '',
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "ventana_inicio" TIME(0) NOT NULL,
    "ventana_fin" TIME(0) NOT NULL,
    "dias_recepcion" SMALLINT[],
    "tiempo_atencion_min" SMALLINT NOT NULL DEFAULT 5,
    "indicaciones" VARCHAR(300) NOT NULL DEFAULT '',
    "estado" "estado_cliente" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidentes_ruta" (
    "id" UUID NOT NULL,
    "ruta_id" UUID NOT NULL,
    "tipo" "tipo_incidente" NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL DEFAULT '',
    "retraso_min" SMALLINT NOT NULL DEFAULT 0,
    "factor_velocidad" DECIMAL(3,2) NOT NULL,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "hora_referencia" TIME(0) NOT NULL,
    "resultado" "resultado_incidente" NOT NULL,
    "resumen" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidentes_ruta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_codigo_key" ON "clientes"("codigo");

-- CreateIndex
CREATE INDEX "clientes_estado_idx" ON "clientes"("estado");

-- CreateIndex
CREATE INDEX "incidentes_ruta_ruta_id_idx" ON "incidentes_ruta"("ruta_id");

-- AddForeignKey
ALTER TABLE "incidentes_ruta" ADD CONSTRAINT "incidentes_ruta_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
