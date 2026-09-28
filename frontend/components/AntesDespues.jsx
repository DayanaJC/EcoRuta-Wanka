// Comparación ambiental de la ruta: orden elegido por el operador (antes)
// frente al orden optimizado (después). Estimación con el consumo promedio
// y el factor de emisión registrados en el vehículo.

import { Leaf } from 'lucide-react'
import { formatearNumero } from '../utils/formatos.js'

// litros = km × consumo (L/100 km) ÷ 100 · CO₂ (kg) = litros × factor (kg CO₂/L)
const estimar = (km, vehiculo) => {
  const litros = (km * vehiculo.consumo_combustible_l100km) / 100
  return { km, litros, co2: litros * vehiculo.factor_emision_co2_kg_l }
}

const fmt = (n, decimales) => formatearNumero(Number(n.toFixed(decimales)))

export function AntesDespues({ ruta, vehiculo }) {
  if (ruta.distancia_sin_optimizar_km == null || ruta.distancia_estimada_km == null || !vehiculo) return null

  const antes = estimar(ruta.distancia_sin_optimizar_km, vehiculo)
  const despues = estimar(ruta.distancia_estimada_km, vehiculo)
  const ahorro = { km: antes.km - despues.km, litros: antes.litros - despues.litros, co2: antes.co2 - despues.co2 }
  const porcentaje = antes.km > 0 ? Math.round((ahorro.km / antes.km) * 100) : 0
  const hayAhorro = ahorro.km > 0.01

  const filas = [
    ['Distancia', 'km', 'km', 2],
    ['Combustible', 'litros', 'L', 2],
    ['Emisiones de CO₂', 'co2', 'kg', 2],
  ]

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2 className="acciones">
          <Leaf size={18} aria-hidden /> Antes y después de optimizar
        </h2>
        {hayAhorro && <span className="badge tono-verde">−{porcentaje} % de recorrido</span>}
      </div>
      <div className="tabla-envoltorio">
        <table className="tabla tabla-responsiva">
          <thead>
            <tr>
              <th></th>
              <th>Antes · orden elegido</th>
              <th>Después · ruta optimizada</th>
              <th>Ahorro</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(([etiqueta, clave, unidad, decimales]) => (
              <tr key={clave}>
                <td className="texto-principal">{etiqueta}</td>
                <td data-etiqueta="Antes" className="num">
                  {fmt(antes[clave], decimales)} {unidad}
                </td>
                <td data-etiqueta="Después" className="num">
                  {fmt(despues[clave], decimales)} {unidad}
                </td>
                <td data-etiqueta="Ahorro" className={`num ${hayAhorro ? 'texto-ahorro' : 'texto-secundario'}`}>
                  {hayAhorro ? `${fmt(ahorro[clave], decimales)} ${unidad}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ayuda" style={{ padding: '12px 20px' }}>
        {hayAhorro
          ? 'Antes = recorrer los pedidos en el orden en que se eligieron; después = orden calculado por la optimización.'
          : 'El orden elegido ya coincidía con el recorrido óptimo.'}{' '}
        Estimación: litros = km × {formatearNumero(vehiculo.consumo_combustible_l100km)} L/100 km; CO₂ = litros ×{' '}
        {formatearNumero(vehiculo.factor_emision_co2_kg_l)} kg/L. No incluye pendientes, carga ni tráfico.
      </p>
    </section>
  )
}
