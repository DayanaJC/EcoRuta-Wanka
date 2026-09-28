// Enlaces de Google Maps (Maps URLs) para abrir una ruta ya optimizada.
// No requieren API key ni cuenta de facturación de Google Cloud:
// https://developers.google.com/maps/documentation/urls/get-started
//
// Cada enlace admite como máximo 9 paradas intermedias (waypoints), por eso
// las rutas largas se dividen en tramos consecutivos que comparten extremos.

export const MAX_PARADAS_INTERMEDIAS = 9

const coordenada = ([lat, lon]) => `${lat.toFixed(6)},${lon.toFixed(6)}`

function urlDirecciones(puntos) {
  const params = new URLSearchParams({
    api: '1',
    origin: coordenada(puntos[0]),
    destination: coordenada(puntos[puntos.length - 1]),
    travelmode: 'driving',
  })
  const intermedios = puntos.slice(1, -1)
  if (intermedios.length) params.set('waypoints', intermedios.map(coordenada).join('|'))
  return `https://www.google.com/maps/dir/?${params}`
}

/**
 * @param {[number, number]} almacen  [lat, lon] de salida y regreso
 * @param {{ latitud: number, longitud: number }[]} paradas  en el orden optimizado
 * @returns {{ etiqueta: string, url: string }[]}
 */
export function enlacesGoogleMaps(almacen, paradas) {
  if (!almacen || paradas.length === 0) return []
  const puntos = [almacen, ...paradas.map((p) => [p.latitud, p.longitud]), almacen]
  const porTramo = MAX_PARADAS_INTERMEDIAS + 1 // puntos que avanza cada enlace

  const enlaces = []
  for (let inicio = 0; inicio < puntos.length - 1; inicio += porTramo) {
    const tramo = puntos.slice(inicio, inicio + porTramo + 1)
    enlaces.push({ desde: inicio, hasta: inicio + tramo.length - 1, url: urlDirecciones(tramo) })
  }

  const total = paradas.length + 1 // índice del regreso al almacén
  const nombre = (i) => (i === 0 || i === total ? 'almacén' : `parada ${i}`)
  return enlaces.map((e, i) => ({
    etiqueta: enlaces.length === 1 ? 'Abrir ruta en Google Maps' : `Tramo ${i + 1}: ${nombre(e.desde)} → ${nombre(e.hasta)}`,
    url: e.url,
  }))
}
