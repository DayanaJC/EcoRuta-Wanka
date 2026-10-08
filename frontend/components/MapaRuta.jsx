'use client'

// Mapa de una ruta (RF-04): trazado sobre calles, almacén y paradas numeradas.
// Se carga solo en el navegador (Leaflet necesita window), ver RutaFormulario.jsx.

import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

export const HUANCAYO = [-12.0681, -75.2104]
// Color de cada parada según el resultado de la entrega
export const COLOR_PARADA = { pendiente: '#2563eb', entregada: '#16a34a', no_entregada: '#dc2626' }
const ESTADO_PARADA = { pendiente: 'Pendiente', entregada: 'Entregada', no_entregada: 'No entregada' }

export const icono = (texto, color) =>
  L.divIcon({
    className: '',
    html: `<div class="marcador-mapa" style="background:${color}">${texto}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

export function Encuadrar({ puntos }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length > 1) map.fitBounds(L.latLngBounds(puntos), { padding: [30, 30] })
  }, [map, puntos])
  return null
}

export default function MapaRuta({ geometria, paradas }) {
  const trazado = geometria ?? []
  const almacen = trazado[0]
  const puntos = [...trazado, ...paradas.map((p) => [p.latitud, p.longitud])]

  return (
    <MapContainer center={almacen ?? HUANCAYO} zoom={13} className="mapa-ruta">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Encuadrar puntos={puntos} />
      {trazado.length > 1 && <Polyline positions={trazado} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }} />}
      {almacen && (
        <Marker position={almacen} icon={icono('A', '#0f3d25')}>
          <Popup>Almacén (salida y regreso)</Popup>
        </Marker>
      )}
      {paradas.map((p) => (
        <Marker key={p.orden} position={[p.latitud, p.longitud]} icon={icono(p.orden, COLOR_PARADA[p.estado ?? 'pendiente'])}>
          <Popup>
            <strong>
              {p.orden}. {p.cliente_nombre}
            </strong>
            <br />
            {p.direccion}
            <br />
            Entrega estimada: {p.hora_estimada_llegada ?? '—'} · ventana {p.ventana_entrega_inicio}–{p.ventana_entrega_fin}
            <br />
            Estado: {ESTADO_PARADA[p.estado ?? 'pendiente']}
            {p.motivo_no_entrega ? ` (${p.motivo_no_entrega})` : ''}
          </Popup>
        </Marker>
      ))}
      <div className="leyenda-mapa">
        <span>
          <i style={{ background: '#0f3d25' }} /> Almacén
        </span>
        <span>
          <i style={{ background: COLOR_PARADA.entregada }} /> Entregada
        </span>
        <span>
          <i style={{ background: COLOR_PARADA.pendiente }} /> Pendiente
        </span>
        <span>
          <i style={{ background: COLOR_PARADA.no_entregada }} /> No entregada
        </span>
      </div>
    </MapContainer>
  )
}
