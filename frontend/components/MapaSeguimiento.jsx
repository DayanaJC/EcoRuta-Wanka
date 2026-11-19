'use client'

// Mapa del seguimiento público: el almacén de salida y el punto de entrega del cliente.
// No muestra el recorrido del vehículo (pasaría por las direcciones de otros clientes).

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet'

const icono = (clase, texto) =>
  L.divIcon({ className: '', html: `<div class="seg-pin ${clase}">${texto}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] })

const ALMACEN = icono('seg-pin-almacen', 'A')
const DESTINO = icono('seg-pin-destino', '●')

export default function MapaSeguimiento({ almacen, destino, enCamino }) {
  const a = [almacen.latitud, almacen.longitud]
  const d = [destino.latitud, destino.longitud]
  return (
    <MapContainer
      bounds={L.latLngBounds([a, d]).pad(0.25)}
      className="seg-mapa"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={[a, d]}
        pathOptions={{ color: enCamino ? '#16a34a' : '#94a3b8', weight: 3, dashArray: '6 8', className: enCamino ? 'seg-linea-viva' : '' }}
      />
      <Marker position={a} icon={ALMACEN}>
        <Tooltip direction="top" offset={[0, -14]}>{almacen.nombre}</Tooltip>
      </Marker>
      <Marker position={d} icon={DESTINO}>
        <Tooltip direction="top" offset={[0, -14]}>Tu punto de entrega</Tooltip>
      </Marker>
    </MapContainer>
  )
}
