// Punto de entrada: conecta los repositorios de Neon y el cliente de
// OpenRouteService y expone la aplicación Express.
//
// En Vercel, este archivo es la entrada de la función: Vercel importa la app
// exportada por defecto. En local (sin la variable VERCEL) se levanta el
// servidor HTTP con app.listen.

import express from "express";
import { crearApp } from "./aplicacion.js";
import { config } from "./config/env.js";
import { obtenerPrisma } from "./db/prisma.js";
import { crearRepositorios } from "./repositories/prisma.repositories.js";
import { crearGeocodificador } from "./services/geocodificacion/nominatim.client.js";
import { crearClienteOrs } from "./services/optimizacion/ors.client.js";

const api = crearApp({
  repos: crearRepositorios(obtenerPrisma()),
  optimizador: crearClienteOrs({ apiKey: config.orsApiKey }),
  geocodificador: crearGeocodificador(),
  almacen: config.almacen,
  zonaHoraria: config.zonaHoraria,
  traficoHabilitado: config.traficoHabilitado,
  margenVentanaMin: config.margenVentanaMin,
  origenesCors: config.frontendUrls,
});

const app = express();
app.use(api);

if (!process.env.VERCEL) {
  app.listen(config.puerto, () => {
    console.log(`EcoRuta Wanka API escuchando en http://localhost:${config.puerto}`);
    if (!config.orsApiKey) console.warn("Aviso: falta ORS_API_KEY; la generación de rutas responderá 503.");
  });
}

export default app;
