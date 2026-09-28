import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: la URL de la base de datos se configura aquí, no en schema.prisma.
// Las migraciones usan la conexión directa de Neon (sin pooling), como recomienda Neon;
// la aplicación usa DATABASE_URL (con pooling) en src/db/prisma.js.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
