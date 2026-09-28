// Punto de entrada: conecta los repositorios de Neon y el cliente de
// OpenRouteService, y levanta el servidor HTTP.

import { crearApp } from "./app.js";
import { config } from "./config/env.js";
import { obtenerPrisma } from "./db/prisma.js";
import { crearRepositorios } from "./repositories/prisma.repositories.js";
import { crearGeocodificador } from "./services/geocodificacion/nominatim.client.js";
import { crearClienteOrs } from "./services/optimizacion/ors.client.js";

const app = crearApp({
  repos: crearRepositorios(obtenerPrisma()),
  optimizador: crearClienteOrs({ apiKey: config.orsApiKey }),
  geocodificador: crearGeocodificador(),
  almacen: config.almacen,
  zonaHoraria: config.zonaHoraria,
  traficoHabilitado: config.traficoHabilitado,
  margenVentanaMin: config.margenVentanaMin,
  origenesCors: [config.frontendUrl],
});

app.listen(config.puerto, () => {
  console.log(`EcoRuta Wanka API escuchando en http://localhost:${config.puerto}`);
  if (!config.orsApiKey) console.warn("Aviso: falta ORS_API_KEY; la generación de rutas responderá 503.");
});
