'use client'

// Mapa para marcar la ubicación de entrega de un pedido (clic o arrastrar el pin).
// Se carga solo en el navegador (Leaflet necesita window).

import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const HUANCAYO = [-12.0681, -75.2104]

const pin = L.divIcon({
  className: '',
  html: '<div class="marcador-mapa" style="background:#16a34a">●</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function Clics({ onCambiar }) {
  useMapEvents({ click: (e) => onCambiar?.([e.latlng.lat, e.latlng.lng]) })
  return null
}

// Centra el mapa cuando la posición cambia desde fuera (buscador de direcciones)
function Seguir({ posicion }) {
  const map = useMap()
  useEffect(() => {
    if (posicion) map.setView(posicion, Math.max(map.getZoom(), 16))
  }, [map, posicion])
  return null
}

export default function MapaSelector({ posicion, onCambiar, soloLectura = false }) {
  return (
    <MapContainer center={posicion ?? HUANCAYO} zoom={posicion ? 16 : 13} className="mapa-selector" scrollWheelZoom={!soloLectura}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {!soloLectura && <Clics onCambiar={onCambiar} />}
      <Seguir posicion={posicion} />
      {posicion && (
        <Marker
          position={posicion}
          icon={pin}
          draggable={!soloLectura}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng()
              onCambiar?.([lat, lng])
            },
          }}
        />
      )}
    </MapContainer>
  )
}
