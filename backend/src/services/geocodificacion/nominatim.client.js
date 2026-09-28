// Geocodificación de direcciones con Nominatim (OpenStreetMap).
// Política de uso: máximo 1 consulta por segundo y User-Agent identificable.
// https://operations.osmfoundation.org/policies/nominatim/

import { OptimizacionExternaError } from "../../errors/errores.js";

const URL_NOMINATIM = "https://nominatim.openstreetmap.org/search";
// Zona de Huancayo y el valle del Mantaro: se prioriza, pero no se limita a ella
const VIEWBOX_HUANCAYO = "-75.40,-11.90,-75.05,-12.25";

export function crearGeocodificador({ fetchImpl = fetch, intervaloMs = 1000 } = {}) {
  let ultimaConsulta = 0;

  return {
    /** @returns {Promise<{ nombre: string, latitud: number, longitud: number }[]>} */
    async buscar(texto) {
      const espera = ultimaConsulta + intervaloMs - Date.now();
      if (espera > 0) await new Promise((r) => setTimeout(r, espera));
      ultimaConsulta = Date.now();

      const params = new URLSearchParams({
        q: texto,
        format: "jsonv2",
        countrycodes: "pe",
        viewbox: VIEWBOX_HUANCAYO,
        limit: "5",
        "accept-language": "es",
      });
      let respuesta;
      try {
        respuesta = await fetchImpl(`${URL_NOMINATIM}?${params}`, {
          headers: { "User-Agent": "EcoRutaWanka/1.0 (proyecto academico, Huancayo)" },
          signal: AbortSignal.timeout(15_000),
        });
      } catch (e) {
        throw new OptimizacionExternaError(`No se pudo contactar al servicio de direcciones: ${e.message}`);
      }
      if (!respuesta.ok) throw new OptimizacionExternaError(`El servicio de direcciones respondió HTTP ${respuesta.status}.`);
      const datos = await respuesta.json();
      return datos.map((r) => ({ nombre: r.display_name, latitud: Number(r.lat), longitud: Number(r.lon) }));
    },
  };
}
