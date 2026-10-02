// Geocodificación de direcciones con Nominatim (OpenStreetMap): texto -> coordenadas
// (buscar) y coordenadas -> dirección (invertir, al marcar un punto en el mapa).
// Política de uso: máximo 1 consulta por segundo y User-Agent identificable.
// https://operations.osmfoundation.org/policies/nominatim/

import { OptimizacionExternaError } from "../../errors/errores.js";

const URL_NOMINATIM = "https://nominatim.openstreetmap.org";
// Zona de Huancayo y el valle del Mantaro: se prioriza, pero no se limita a ella
const VIEWBOX_HUANCAYO = "-75.40,-11.90,-75.05,-12.25";

// Dirección corta para el formulario: "Jirón Puno 450, San Carlos, Huancayo"
export function direccionCorta(r) {
  const a = r.address ?? {};
  const via = [a.road ?? a.pedestrian ?? a.footway, a.house_number].filter(Boolean).join(" ");
  const lugar = r.name && r.name !== a.road ? r.name : null;
  const zona = a.neighbourhood ?? a.quarter ?? a.suburb ?? a.village ?? a.hamlet;
  const ciudad = a.city ?? a.town ?? a.municipality ?? a.county;
  const partes = [lugar, via, zona, ciudad].filter(Boolean);
  // Sin partes reconocibles: los tres primeros tramos del nombre completo
  return partes.length ? [...new Set(partes)].join(", ") : (r.display_name ?? "").split(", ").slice(0, 3).join(", ");
}

const aResultado = (r) => ({
  direccion: direccionCorta(r),
  nombre: r.display_name,
  latitud: Number(r.lat),
  longitud: Number(r.lon),
});

export function crearGeocodificador({ fetchImpl = fetch, intervaloMs = 1000 } = {}) {
  let ultimaConsulta = 0;

  async function consultar(ruta, params) {
    const espera = ultimaConsulta + intervaloMs - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaConsulta = Date.now();

    let respuesta;
    try {
      respuesta = await fetchImpl(`${URL_NOMINATIM}/${ruta}?${new URLSearchParams({ format: "jsonv2", addressdetails: "1", "accept-language": "es", ...params })}`, {
        headers: { "User-Agent": "EcoRutaWanka/1.0 (proyecto academico, Huancayo)" },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (e) {
      throw new OptimizacionExternaError(`No se pudo contactar al servicio de direcciones: ${e.message}`);
    }
    if (!respuesta.ok) throw new OptimizacionExternaError(`El servicio de direcciones respondió HTTP ${respuesta.status}.`);
    return respuesta.json();
  }

  return {
    /** @returns {Promise<{ direccion: string, nombre: string, latitud: number, longitud: number }[]>} */
    async buscar(texto) {
      const datos = await consultar("search", { q: texto, countrycodes: "pe", viewbox: VIEWBOX_HUANCAYO, limit: "5" });
      return datos.map(aResultado);
    },

    /** Dirección más cercana a un punto (null si no hay ninguna, p. ej. en medio del campo) */
    async invertir(latitud, longitud) {
      const datos = await consultar("reverse", { lat: String(latitud), lon: String(longitud), zoom: "18" });
      if (!datos || datos.error) return null;
      return { ...aResultado(datos), latitud, longitud };
    },
  };
}
