// Gráfico de barras agrupadas: CO₂ por día sin optimizar frente a la ruta optimizada.
// SVG propio (sin librerías): eje y en kg, tooltip al pasar el cursor o tocar un día
// y vista de tabla equivalente para quien no puede leer el gráfico.

import { useEffect, useRef, useState } from 'react'
import { formatearNumero } from '../utils/formatos.js'

// Paleta validada (scripts de dataviz): contraste ≥ 3:1 y separación para daltonismo
export const SERIES_CO2 = [
  { clave: 'co2_sin_optimizar_kg', etiqueta: 'Sin optimizar (orden elegido)', color: '#5b6fd6' },
  { clave: 'co2_kg', etiqueta: 'Ruta optimizada', color: '#16a34a' },
]

const ALTO = 240
const M = { arriba: 12, derecha: 8, abajo: 28, izquierda: 44 }

// Escala "redonda" para el eje: 1, 2, 2.5 o 5 × 10^n
function escala(max) {
  const bruto = max / 4
  const potencia = 10 ** Math.floor(Math.log10(bruto || 1))
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * potencia).find((p) => p >= bruto)
  return { paso, tope: paso * 4 }
}

const diaCorto = (yyyymmdd) => new Date(`${yyyymmdd}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })

function useAncho() {
  const ref = useRef(null)
  const [ancho, setAncho] = useState(320)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setAncho(Math.max(280, Math.floor(e.contentRect.width))))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, ancho]
}

export function GraficoCo2({ dias }) {
  const [ref, ancho] = useAncho()
  const [activo, setActivo] = useState(null)
  const [comoTabla, setComoTabla] = useState(false)

  const max = Math.max(...dias.flatMap((d) => SERIES_CO2.map((s) => d[s.clave])), 0.1)
  const { paso, tope } = escala(max)
  const anchoUtil = ancho - M.izquierda - M.derecha
  const altoUtil = ALTO - M.arriba - M.abajo
  const grupo = anchoUtil / dias.length
  const barra = Math.max(3, Math.min(22, (grupo - 10) / 2))
  const y = (v) => M.arriba + altoUtil - (v / tope) * altoUtil
  // Etiquetas del eje x sin amontonarse
  const cadaN = Math.ceil(dias.length / Math.max(1, Math.floor(anchoUtil / 56)))
  const radio = Math.min(4, barra / 2)
  // Barra con las esquinas superiores redondeadas y la base recta sobre el eje
  const trazo = (x, valor) => {
    const top = y(valor)
    const base = y(0)
    const r = Math.min(radio, base - top)
    if (base - top < 0.5) return ''
    return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + barra - r}Q${x + barra},${top} ${x + barra},${top + r}V${base}Z`
  }
  const dia = activo != null ? dias[activo] : null

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>Emisiones de CO₂ por día</h2>
        <button type="button" className="boton boton-fantasma boton-sm" onClick={() => setComoTabla((v) => !v)}>
          {comoTabla ? 'Ver gráfico' : 'Ver como tabla'}
        </button>
      </div>
      <div className="leyenda-grafico" aria-hidden={comoTabla}>
        {SERIES_CO2.map((s) => (
          <span key={s.clave}>
            <i style={{ background: s.color }} /> {s.etiqueta}
          </span>
        ))}
      </div>

      {comoTabla ? (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>Día</th>
                <th className="num">Rutas</th>
                {SERIES_CO2.map((s) => (
                  <th key={s.clave} className="num">
                    {s.etiqueta} (kg)
                  </th>
                ))}
                <th className="num">Evitado (kg)</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((d) => (
                <tr key={d.fecha}>
                  <td>{diaCorto(d.fecha)}</td>
                  <td className="num">{d.rutas}</td>
                  {SERIES_CO2.map((s) => (
                    <td key={s.clave} className="num">
                      {formatearNumero(d[s.clave])}
                    </td>
                  ))}
                  <td className="num">{formatearNumero(d.co2_evitado_kg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grafico" ref={ref} onMouseLeave={() => setActivo(null)}>
          <svg width={ancho} height={ALTO} role="img" aria-label="Emisiones de CO₂ por día, sin optimizar y con la ruta optimizada">
            {[0, 1, 2, 3, 4].map((k) => (
              <g key={k}>
                <line x1={M.izquierda} x2={ancho - M.derecha} y1={y(paso * k)} y2={y(paso * k)} className={k === 0 ? 'grafico-eje' : 'grafico-guia'} />
                <text x={M.izquierda - 8} y={y(paso * k)} dy="0.32em" textAnchor="end" className="grafico-texto">
                  {formatearNumero(paso * k)}
                </text>
              </g>
            ))}
            <text x={4} y={M.arriba - 2} className="grafico-texto" dy="0.7em">
              kg
            </text>
            {dias.map((d, i) => {
              const x0 = M.izquierda + i * grupo + (grupo - barra * 2 - 2) / 2
              return (
                <g key={d.fecha} opacity={activo == null || activo === i ? 1 : 0.45}>
                  {SERIES_CO2.map((s, j) => (
                    <path key={s.clave} d={trazo(x0 + j * (barra + 2), d[s.clave])} fill={s.color} />
                  ))}
                  {i % cadaN === 0 && (
                    <text x={M.izquierda + i * grupo + grupo / 2} y={ALTO - 8} textAnchor="middle" className="grafico-texto">
                      {diaCorto(d.fecha)}
                    </text>
                  )}
                  {/* Zona sensible: todo el alto del día, más grande que las barras */}
                  <rect
                    x={M.izquierda + i * grupo}
                    y={M.arriba}
                    width={grupo}
                    height={altoUtil}
                    fill="transparent"
                    onMouseEnter={() => setActivo(i)}
                    onClick={() => setActivo(i)}
                  />
                </g>
              )
            })}
          </svg>
          {dia && (
            <div
              className="grafico-tooltip"
              style={{
                left: Math.min(Math.max(M.izquierda + activo * grupo + grupo / 2, 90), ancho - 90),
                top: Math.max(4, y(Math.max(dia.co2_sin_optimizar_kg, dia.co2_kg)) - 8),
              }}
              role="status"
            >
              <strong>{diaCorto(dia.fecha)}</strong> · {dia.rutas} ruta(s)
              {SERIES_CO2.map((s) => (
                <div key={s.clave} className="acciones">
                  <i style={{ background: s.color }} /> {s.etiqueta}: <strong className="num">{formatearNumero(dia[s.clave])} kg</strong>
                </div>
              ))}
              <div>
                Evitado: <strong className="num">{formatearNumero(dia.co2_evitado_kg)} kg</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
