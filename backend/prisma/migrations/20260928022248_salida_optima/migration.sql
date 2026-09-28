-- AlterTable
ALTER TABLE "ruta_paradas" ADD COLUMN     "espera_min" SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "hora_disponible" TIME(0);
