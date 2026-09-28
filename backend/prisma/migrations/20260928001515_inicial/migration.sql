-- CreateEnum
CREATE TYPE "tipo_vehiculo" AS ENUM ('camioneta', 'furgon', 'moto');

-- CreateEnum
CREATE TYPE "estado_vehiculo" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "prioridad_pedido" AS ENUM ('express', 'estandar', 'economico');

-- CreateEnum
CREATE TYPE "tipo_producto" AS ENUM ('perecedero', 'no_perecedero');

-- CreateEnum
CREATE TYPE "estado_pedido" AS ENUM ('pendiente', 'en_ruta', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "estado_asignacion" AS ENUM ('asignada', 'cancelada');

-- CreateEnum
CREATE TYPE "estado_ruta" AS ENUM ('generada', 'en_reparto', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "tipo_dia" AS ENUM ('laborable', 'fin_semana');

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" UUID NOT NULL,
    "placa" VARCHAR(7) NOT NULL,
    "tipo" "tipo_vehiculo" NOT NULL,
    "capacidad_carga_kg" DECIMAL(8,2) NOT NULL,
    "consumo_combustible_l100km" DECIMAL(5,2) NOT NULL,
    "factor_emision_co2_kg_l" DECIMAL(5,3) NOT NULL,
    "anio_fabricacion" SMALLINT NOT NULL,
    "estado" "estado_vehiculo" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "cliente_id" VARCHAR(50) NOT NULL,
    "cliente_nombre" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "punto_referencia" VARCHAR(200) NOT NULL DEFAULT '',
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "peso_kg" DECIMAL(8,2) NOT NULL,
    "volumen_m3" DECIMAL(6,3) NOT NULL,
    "ventana_entrega_inicio" TIME(0) NOT NULL,
    "ventana_entrega_fin" TIME(0) NOT NULL,
    "tiempo_servicio_min" SMALLINT NOT NULL DEFAULT 5,
    "prioridad" "prioridad_pedido" NOT NULL,
    "tipo_producto" "tipo_producto" NOT NULL,
    "estado" "estado_pedido" NOT NULL DEFAULT 'pendiente',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "vehiculo_id" UUID NOT NULL,
    "fecha_asignacion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "estado_asignacion" NOT NULL DEFAULT 'asignada',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutas" (
    "id" UUID NOT NULL,
    "vehiculo_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_salida" TIME(0) NOT NULL,
    "distancia_estimada_km" DECIMAL(7,2),
    "tiempo_estimado_min" INTEGER,
    "factor_trafico_aplicado" DECIMAL(4,2),
    "geometria" JSONB,
    "estado" "estado_ruta" NOT NULL DEFAULT 'generada',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruta_paradas" (
    "id" UUID NOT NULL,
    "ruta_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "orden" SMALLINT NOT NULL,
    "hora_estimada_llegada" TIME(0),

    CONSTRAINT "ruta_paradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factores_trafico" (
    "id" UUID NOT NULL,
    "tipo_dia" "tipo_dia" NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fin" TIME(0) NOT NULL,
    "factor" DECIMAL(4,2) NOT NULL,
    "descripcion" VARCHAR(100),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "factores_trafico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placa_key" ON "vehiculos"("placa");

-- CreateIndex
CREATE INDEX "vehiculos_estado_idx" ON "vehiculos"("estado");

-- CreateIndex
CREATE INDEX "pedidos_estado_idx" ON "pedidos"("estado");

-- CreateIndex
CREATE INDEX "pedidos_prioridad_idx" ON "pedidos"("prioridad");

-- CreateIndex
CREATE INDEX "asignaciones_pedido_id_idx" ON "asignaciones"("pedido_id");

-- CreateIndex
CREATE INDEX "asignaciones_vehiculo_id_idx" ON "asignaciones"("vehiculo_id");

-- CreateIndex
CREATE INDEX "rutas_vehiculo_id_idx" ON "rutas"("vehiculo_id");

-- CreateIndex
CREATE INDEX "ruta_paradas_pedido_id_idx" ON "ruta_paradas"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "ruta_paradas_ruta_id_orden_key" ON "ruta_paradas"("ruta_id", "orden");

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruta_paradas" ADD CONSTRAINT "ruta_paradas_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruta_paradas" ADD CONSTRAINT "ruta_paradas_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Regla RN-005: un pedido solo puede tener una asignación activa a la vez.
CREATE UNIQUE INDEX "asignaciones_pedido_activo_key" ON "asignaciones"("pedido_id") WHERE "estado" = 'asignada';

-- Restricciones de dominio (doc. 11 Base de datos)
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_placa_formato" CHECK ("placa" ~ '^[A-Z]{3}-[0-9]{3}$');
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_capacidad_positiva" CHECK ("capacidad_carga_kg" > 0);
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_coordenadas_validas" CHECK ("latitud" BETWEEN -90 AND 90 AND "longitud" BETWEEN -180 AND 180);
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_peso_positivo" CHECK ("peso_kg" > 0);
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_ventana_valida" CHECK ("ventana_entrega_fin" > "ventana_entrega_inicio");
ALTER TABLE "factores_trafico" ADD CONSTRAINT "factores_trafico_rango" CHECK ("factor" BETWEEN 0.3 AND 1.0 AND "hora_fin" > "hora_inicio");
