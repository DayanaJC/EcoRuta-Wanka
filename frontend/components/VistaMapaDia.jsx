import { ChevronLeft, ChevronRight, Map as IconoMapa } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { colorRuta, formatearDuracion, formatearFechaCorta, formatearKm, hoyEnLima, sumarDias } from '../utils/formatos.js'
import { BadgeEstadoRuta } from './Badges.jsx'
import { EstadoVacio } from './ui.jsx'

const MapaDia = dynamic(() => import('./MapaDia.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-ruta mapa-cargando">Cargando mapa…</div>,
})

// Día inicial: hoy si tiene rutas; si no, el día más reciente con rutas
const diaInicial = (rutas) => {
  const hoy = hoyEnLima()
  const fechas = rutas.filter((r) => r.estado !== 'cancelada').map((r) => r.fecha)
  if (!fechas.length || fechas.includes(hoy)) return hoy
  return fechas.filter((f) => f <= hoy).sort().at(-1) ?? fechas.sort()[0]
}

export function VistaMapaDia({ rutas, pedidosPorId, vehiculosPorId, conductoresPorId, onVer, notificar }) {
  const [fecha, setFecha] = useState(() => diaInicial(rutas))
  const [estado, setEstado] = useState({ fecha: null, rutas: [] })

  // El listado general no trae el trazado: se pide el del día elegido
  useEffect(() => {
    let activo = true
    api
      .listarRutas({ desde: fecha, hasta: fecha, geometria: 'true' })
      .then((r) => activo && setEstado({ fecha, rutas: r.filter((x) => x.estado !== 'cancelada').sort((a, b) => a.hora_salida.localeCompare(b.hora_salida)) }))
      .catch((e) => activo && notificar('error', `No se pudo cargar el mapa: ${e.message}`))
    return () => {
      activo = false
    }
  }, [fecha, notificar])

  const cargando = estado.fecha !== fecha
  const delDia = cargando ? [] : estado.rutas
  const etiqueta = (r) => `${vehiculosPorId[r.vehiculo_id]?.placa ?? 'Ruta'} · salida ${r.hora_salida}`

  return (
    <div className="pila">
      <div className="tarjeta barra-filtros" style={{ borderRadius: 'var(--radio-lg)' }}>
        <div className="acciones">
          <button type="button" className="boton boton-secundario boton-icono" onClick={() => setFecha(sumarDias(fecha, -1))} aria-label="Día anterior">
            <ChevronLeft size={16} />
          </button>
          <input className="campo" type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} aria-label="Fecha" style={{ width: 'auto' }} />
          <button type="button" className="boton boton-secundario boton-icono" onClick={() => setFecha(sumarDias(fecha, 1))} aria-label="Día siguiente">
            <ChevronRight size={16} />
          </button>
          {fecha !== hoyEnLima() && (
            <button type="button" className="boton boton-fantasma boton-sm" onClick={() => setFecha(hoyEnLima())}>
              Hoy
            </button>
          )}
        </div>
        <span className="texto-secundario">
          {cargando ? 'Cargando…' : `${formatearFechaCorta(fecha)} · ${delDia.length} ruta(s) · ${formatearKm(Number(delDia.reduce((s, r) => s + (r.distancia_estimada_km ?? 0), 0).toFixed(2)))}`}
        </span>
      </div>

      {!cargando && delDia.length === 0 ? (
        <section className="tarjeta">
          <EstadoVacio icono={IconoMapa} titulo="No hay rutas este día" descripcion="Elige otra fecha o genera una ruta para verla en el mapa." />
        </section>
      ) : (
        <div className="detalle-ruta">
          <section className="tarjeta">
            <div className="tarjeta-titulo">
              <h2>Rutas del día</h2>
            </div>
            <ul className="leyenda-rutas">
              {delDia.map((r, i) => (
                <li key={r.id}>
                  <button type="button" className="leyenda-ruta" onClick={() => onVer(r)}>
                    <span className="leyenda-color" style={{ background: colorRuta(i) }} aria-hidden />
                    <span>
                      <span className="texto-principal num">{etiqueta(r)}</span>
                      <span className="texto-secundario">
                        {conductoresPorId[r.conductor_id]?.nombre ?? 'Sin conductor'} · {r.paradas.length} {r.paradas.length === 1 ? 'parada' : 'paradas'} · {formatearKm(r.distancia_estimada_km)} ·{' '}
                        {formatearDuracion(r.tiempo_estimado_min)}
                      </span>
                    </span>
                    <BadgeEstadoRuta estado={r.estado} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="ayuda" style={{ padding: '0 20px 16px' }}>
              Cada color es una ruta; los números indican el orden de entrega. Toca una ruta o una parada para ver su detalle.
            </p>
          </section>
          {cargando ? (
            <div className="mapa-ruta mapa-cargando">Cargando mapa…</div>
          ) : (
            <MapaDia rutas={delDia} pedidosPorId={pedidosPorId} etiquetaRuta={etiqueta} onVer={onVer} />
          )}
        </div>
      )}
    </div>
  )
}
