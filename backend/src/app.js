// Ensambla la aplicación Express. Recibe los repositorios y el optimizador
// por parámetro (inyección de dependencias), así las pruebas pueden usar
// repositorios en memoria y un optimizador simulado.

import cors from "cors";
import express from "express";
import { crearControladores } from "./controllers/controladores.js";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores.js";
import { crearRouterApi } from "./routes/rutas.api.js";
import { crearAsignacionService } from "./services/asignacion.service.js";
import { crearPedidoService } from "./services/pedido.service.js";
import { crearRutaService } from "./services/ruta.service.js";
import { crearVehiculoService } from "./services/vehiculo.service.js";

export function crearApp({
  repos,
  optimizador,
  geocodificador,
  almacen,
  zonaHoraria = "America/Lima",
  traficoHabilitado = false,
  margenVentanaMin = 15,
  origenesCors = [],
}) {
  const servicios = {
    vehiculos: crearVehiculoService(repos),
    pedidos: crearPedidoService(repos),
    asignaciones: crearAsignacionService(repos),
    rutas: crearRutaService(repos, { optimizador, almacen, zonaHoraria, traficoHabilitado, margenVentanaMin }),
    factoresTrafico: { listar: () => repos.factoresTrafico.listar() },
    geocodificador,
    salud: {
      async verificar() {
        let db = { connected: true };
        try {
          await repos.salud.ping();
        } catch (e) {
          db = { connected: false, message: e.message };
        }
        return {
          status: db.connected ? "ok" : "error",
          database: db,
          optimizacion: { configurada: optimizador.configurado, trafico_habilitado: traficoHabilitado },
        };
      },
    },
  };
  const controladores = crearControladores(servicios);

  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: origenesCors }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", controladores.salud);
  app.use("/api/v1", crearRouterApi(controladores));

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}
