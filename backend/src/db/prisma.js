import { PrismaPg } from "@prisma/adapter-pg";
import prismaClient from "@prisma/client";
import pg from "pg";
import { config } from "../config/env.js";

// @prisma/client se publica como CommonJS
const { PrismaClient } = prismaClient;

let cliente = null;

// Cliente único de Prisma conectado a Neon mediante el adaptador de node-postgres.
export function obtenerPrisma() {
  if (!cliente) {
    if (!config.databaseUrl) throw new Error("Falta DATABASE_URL en backend/.env");
    const pool = new pg.Pool({ connectionString: config.databaseUrl });
    // Neon cierra las conexiones inactivas al suspenderse; sin este manejador,
    // el error de una conexión ociosa detendría el proceso. El pool se reconecta solo.
    pool.on("error", (e) => console.warn("[db] conexión inactiva cerrada por el servidor:", e.message));
    cliente = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return cliente;
}
