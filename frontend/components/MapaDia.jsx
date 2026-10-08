'use client'

// Mapa general (RF-04): todas las rutas de un día, cada una con su color.
// Se carga solo en el navegador (Leaflet necesita window).

import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { colorRuta } from '../utils/formatos.js'
import { Encuadrar, HUANCAYO, icono } from './MapaRuta.jsx'

export default function MapaDia({ rutas, pedidosPorId, etiquetaRuta, onVer }) {
  const almacen = rutas.find((r) => r.geometria?.length)?.geometria[0]
  const puntos = useMemo(
    () =>
      rutas.flatMap((r) => [
        ...(r.geometria ?? []),
        ...r.paradas.map((p) => pedidosPorId[p.pedido_id]).filter(Boolean).map((p) => [p.latitud, p.longitud]),
      ]),
    [rutas, pedidosPorId],
  )

  return (
    <MapContainer center={almacen ?? HUANCAYO} zoom={13} className="mapa-ruta mapa-dia">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Encuadrar puntos={puntos} />
      {rutas.map((r, i) =>
        r.geometria?.length > 1 ? (
          <Polyline
            key={r.id}
            positions={r.geometria}
            pathOptions={{ color: colorRuta(i), weight: 4, opacity: r.estado === 'completada' ? 0.55 : 0.9 }}
            eventHandlers={{ click: () => onVer(r) }}
          />
        ) : null,
      )}
      {rutas.flatMap((r, i) =>
        r.paradas.map((p) => {
          const pedido = pedidosPorId[p.pedido_id]
          if (!pedido) return null
          return (
            <Marker key={`${r.id}-${p.orden}`} position={[pedido.latitud, pedido.longitud]} icon={icono(p.orden, colorRuta(i))}>
              <Popup>
                <strong>{etiquetaRuta(r)}</strong>
                <br />
                {p.orden}. {pedido.cliente_nombre} · {p.hora_estimada_llegada ?? '—'}
                <br />
                <button type="button" className="enlace" onClick={() => onVer(r)}>
                  Ver ruta
                </button>
              </Popup>
            </Marker>
          )
        }),
      )}
      {almacen && (
        <Marker position={almacen} icon={icono('A', '#0f3d25')}>
          <Popup>Almacén (salida y regreso)</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
