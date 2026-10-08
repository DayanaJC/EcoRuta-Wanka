// Dashboard de sostenibilidad (RF-05) y reporte en PDF (RF-06).
// Los indicadores se calculan en la API: el PDF y la pantalla muestran las mismas cifras.

import { CircleCheck, CircleDashed, CircleX, Clock, Droplet, FileDown, Leaf, Route, Timer, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { ETIQUETAS_TIPO_VEHICULO, formatearFechaCorta, formatearNumero, hoyEnLima, sumarDias } from '../../utils/formatos.js'
import { BadgeEstadoRuta } from '../Badges.jsx'
import { GraficoCo2 } from '../GraficoCo2.jsx'
import { navegar } from '../navegacion.js'
import { Cargando, EncabezadoPagina, EstadoVacio } from '../ui.jsx'

const PERIODOS = [
  ['7d', 'Últimos 7 días'],
  ['30d', 'Últimos 30 días'],
  ['mes', 'Este mes'],
  ['rango', 'Personalizado'],
]

function rangoDe(periodo, rango) {
  const hoy = hoyEnLima()
  if (periodo === '7d') return { desde: sumarDias(hoy, -6), hasta: hoy }
  if (periodo === '30d') return { desde: sumarDias(hoy, -29), hasta: hoy }
  if (periodo === 'mes') return { desde: `${hoy.slice(0, 8)}01`, hasta: hoy }
  return rango
}

const kg = (n) => `${formatearNumero(n)} kg`
const pct = (n) => (n == null ? '—' : `${formatearNumero(n)} %`)
// Diferencia con signo: la ruta optimizada puede ser más larga si las ventanas horarias lo exigen
const conSigno = (n, unidad) => (Math.abs(n) < 0.005 ? 'sin cambio' : `${n > 0 ? '−' : '+'}${formatearNumero(Math.abs(n))} ${unidad}`)
const comparado = (ahorro, unidad) =>
  Math.abs(ahorro) < 0.005
    ? 'igual que sin optimizar'
    : `${formatearNumero(Math.abs(ahorro))} ${unidad} ${ahorro > 0 ? 'menos' : 'más'} que sin optimizar`
// Columna "CO₂ evitado": la cantidad ahorrada; si la ruta optimizada emitió más, se indica
const evitado = (n) => (Math.abs(n) < 0.005 ? '—' : n > 0 ? kg(n) : `ninguno (+${kg(-n)})`)
const ESTADOS_RUTA_KPI = { completada: ['completada', 'completadas'], en_reparto: ['en reparto', 'en reparto'], generada: ['por iniciar', 'por iniciar'] }

function Kpi({ icono: Icono, tono, etiqueta, valor, extra }) {
  return (
    <div className="tarjeta indicador">
      <div className={`indicador-icono tono-${tono}`}>
        <Icono size={18} aria-hidden />
      </div>
      <div>
        <div className="indicador-valor num">{valor}</div>
        <div className="indicador-etiqueta">{etiqueta}</div>
        {extra && <div className="indicador-extra">{extra}</div>}
      </div>
    </div>
  )
}

// Estado de una meta: icono + texto (nunca solo color)
function Meta({ titulo, detalle, estado }) {
  const config = {
    cumple: { icono: CircleCheck, tono: 'verde', texto: 'Cumple' },
    progreso: { icono: CircleDashed, tono: 'ambar', texto: 'En progreso' },
    no_cumple: { icono: CircleX, tono: 'rojo', texto: 'No cumple' },
    sin_datos: { icono: CircleDashed, tono: 'gris', texto: 'Sin datos' },
  }[estado]
  return (
    <div className="meta">
      <div>
        <div className="texto-principal">{titulo}</div>
        <div className="texto-secundario">{detalle}</div>
      </div>
      <span className={`badge-meta tono-${config.tono}`}>
        <config.icono size={15} aria-hidden /> {config.texto}
      </span>
    </div>
  )
}

export function Sostenibilidad({ datos, notificar }) {
  const [periodo, setPeriodo] = useState('7d')
  const [rango, setRango] = useState(() => ({ desde: sumarDias(hoyEnLima(), -6), hasta: hoyEnLima() }))
  const [vehiculoId, setVehiculoId] = useState('')
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })
  const [descargando, setDescargando] = useState(false)

  const filtros = { ...rangoDe(periodo, rango), vehiculo_id: vehiculoId || undefined }
  const clave = JSON.stringify(filtros)
  const rangoInvalido = periodo === 'rango' && (!rango.desde || !rango.hasta || rango.desde > rango.hasta)

  useEffect(() => {
    if (rangoInvalido) return
    let activo = true
    api
      .indicadores(JSON.parse(clave))
      .then((d) => activo && setResultado({ clave, datos: d, error: null }))
      .catch((error) => activo && setResultado({ clave, datos: null, error }))
    return () => {
      activo = false
    }
  }, [clave, rangoInvalido])

  const cargando = !rangoInvalido && resultado.clave !== clave
  const ind = cargando ? null : resultado.datos
  const t = ind?.totales

  const descargar = async () => {
    setDescargando(true)
    try {
      const blob = await api.reporteSostenibilidad(filtros)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-sostenibilidad_${filtros.desde}_${filtros.hasta}.pdf`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      notificar('exito', 'Reporte de sostenibilidad descargado.')
    } catch (e) {
      notificar('error', e.message)
    } finally {
      setDescargando(false)
    }
  }

  const estadoO1 = t ? (ind.metas_cumplidas.reduccion_co2 ? 'cumple' : 'progreso') : 'sin_datos'
  const estadoO2 = !t || ind.metas_cumplidas.fuera_de_horario == null ? 'sin_datos' : ind.metas_cumplidas.fuera_de_horario ? 'cumple' : 'no_cumple'

  return (
    <>
      <EncabezadoPagina
        titulo="Sostenibilidad"
        descripcion="Distancia, combustible y emisiones de CO₂ del reparto, y el ahorro que logra la optimización de rutas."
      >
        <button type="button" className="boton boton-primario" onClick={descargar} disabled={descargando || !t}>
          {descargando ? <Cargando texto="Generando…" /> : <><FileDown size={17} aria-hidden /> Descargar reporte PDF</>}
        </button>
      </EncabezadoPagina>

      <section className="tarjeta barra-filtros filtros-sostenibilidad" aria-label="Filtros">
        <div className="segmentos" role="group" aria-label="Periodo">
          {PERIODOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={periodo === valor} onClick={() => setPeriodo(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
        {periodo === 'rango' && (
          <div className="acciones">
            <input className="campo" type="date" aria-label="Desde" value={rango.desde} max={rango.hasta} onChange={(e) => setRango((r) => ({ ...r, desde: e.target.value }))} />
            <span className="texto-secundario">al</span>
            <input className="campo" type="date" aria-label="Hasta" value={rango.hasta} min={rango.desde} onChange={(e) => setRango((r) => ({ ...r, hasta: e.target.value }))} />
          </div>
        )}
        <select className="campo" value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)} aria-label="Vehículo">
          <option value="">Todos los vehículos</option>
          {datos.vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} · {ETIQUETAS_TIPO_VEHICULO[v.tipo]}
            </option>
          ))}
        </select>
      </section>

      {rangoInvalido ? (
        <section className="tarjeta">
          <EstadoVacio titulo="Periodo inválido" descripcion="La fecha inicial debe ser anterior o igual a la final." />
        </section>
      ) : resultado.error && !cargando ? (
        <section className="tarjeta">
          <EstadoVacio titulo="No se pudieron calcular los indicadores" descripcion={resultado.error.message} />
        </section>
      ) : cargando ? (
        <section className="indicadores indicadores-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="tarjeta indicador">
              <span className="esqueleto" style={{ width: '70%', height: 44 }} />
            </div>
          ))}
        </section>
      ) : ind.sin_datos ? (
        <section className="tarjeta">
          <EstadoVacio
            icono={Leaf}
            titulo="No existen datos para este periodo"
            descripcion={`No hay rutas registradas del ${formatearFechaCorta(ind.periodo.desde)} al ${formatearFechaCorta(ind.periodo.hasta)}${ind.filtros.placa ? ` para ${ind.filtros.placa}` : ''}. Elige otro periodo o genera rutas.`}
          />
        </section>
      ) : (
        <div className="pila">
          <p className="texto-secundario" style={{ margin: 0 }}>
            Del {formatearFechaCorta(ind.periodo.desde)} al {formatearFechaCorta(ind.periodo.hasta)} · {t.rutas} ruta(s) · {t.paradas} parada(s)
            {ind.filtros.placa ? ` · ${ind.filtros.placa}` : ''}
          </p>

          <section className="indicadores indicadores-3" style={{ marginBottom: 0 }} aria-label="Indicadores del periodo">
            <Kpi icono={Route} tono="azul" etiqueta="Distancia planificada" valor={`${formatearNumero(t.km)} km`} extra={comparado(t.km_ahorrados, 'km')} />
            <Kpi
              icono={Droplet}
              tono="ambar"
              etiqueta="Combustible estimado"
              valor={`${formatearNumero(t.litros)} L`}
              extra={`${formatearNumero(t.litros_ahorrados)} L ahorrados (${pct(t.ahorro_combustible_pct)})`}
            />
            <Kpi icono={Leaf} tono="gris" etiqueta="Emisiones de CO₂" valor={kg(t.co2_kg)} extra={`${kg(t.co2_por_parada_kg)} por parada`} />
            <Kpi icono={TrendingDown} tono="verde" etiqueta="CO₂ evitado" valor={kg(t.co2_evitado_kg)} extra={comparado(t.reduccion_co2_pct, '%')} />
            <Kpi
              icono={Timer}
              tono="violeta"
              etiqueta="Entregas a tiempo"
              valor={pct(t.puntualidad_pct)}
              extra={t.entregadas ? `${t.a_tiempo} de ${t.entregadas} · ${t.no_entregadas} no entregada(s)` : 'Aún sin entregas registradas'}
            />
            <Kpi
              icono={Clock}
              tono="azul"
              etiqueta="Rutas"
              valor={t.rutas}
              extra={Object.entries(ESTADOS_RUTA_KPI)
                .filter(([e]) => t.rutas_por_estado[e])
                .map(([e, [uno, varios]]) => `${t.rutas_por_estado[e]} ${t.rutas_por_estado[e] === 1 ? uno : varios}`)
                .join(' · ')}
            />
          </section>

          <section className="tarjeta">
            <div className="tarjeta-titulo">
              <h2>Avance respecto a las metas del proyecto</h2>
            </div>
            <div className="tarjeta-cuerpo metas">
              <Meta
                titulo={`O1 · Reducir las emisiones de CO₂ en ${ind.metas.reduccion_co2_pct} %`}
                detalle={`Reducción lograda con la optimización: ${pct(t.reduccion_co2_pct)}`}
                estado={estadoO1}
              />
              <Meta
                titulo={`O2 · Entregas fuera de horario por debajo del ${ind.metas.fuera_de_horario_max_pct} %`}
                detalle={t.entregadas ? `Fuera de horario: ${pct(t.fuera_de_horario_pct)} (${t.fuera_de_horario} de ${t.entregadas})` : 'Sin entregas registradas en el periodo'}
                estado={estadoO2}
              />
            </div>
          </section>

          <GraficoCo2 dias={ind.por_dia} />

          <section className="tarjeta">
            <div className="tarjeta-titulo">
              <h2>Por vehículo</h2>
            </div>
            <div className="tabla-envoltorio">
              <table className="tabla tabla-responsiva">
                <thead>
                  <tr>
                    <th>Vehículo</th>
                    <th>Rutas</th>
                    <th>Distancia</th>
                    <th>Combustible</th>
                    <th>CO₂</th>
                    <th>CO₂ evitado</th>
                    <th>A tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {ind.por_vehiculo.map((v) => (
                    <tr key={v.vehiculo_id}>
                      <td data-etiqueta="Vehículo">
                        <div>
                          <div className="texto-principal num">{v.placa ?? '—'}</div>
                          <div className="texto-secundario">{ETIQUETAS_TIPO_VEHICULO[v.tipo] ?? ''}</div>
                        </div>
                      </td>
                      <td data-etiqueta="Rutas" className="num">{v.rutas}</td>
                      <td data-etiqueta="Distancia" className="num">{formatearNumero(v.km)} km</td>
                      <td data-etiqueta="Combustible" className="num">{formatearNumero(v.litros)} L</td>
                      <td data-etiqueta="CO₂" className="num">{kg(v.co2_kg)}</td>
                      <td data-etiqueta="CO₂ evitado" className="num">{evitado(v.co2_evitado_kg)}</td>
                      <td data-etiqueta="A tiempo" className="num">{v.entregadas ? `${v.a_tiempo}/${v.entregadas} (${pct(v.puntualidad_pct)})` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="tarjeta">
            <div className="tarjeta-titulo">
              <h2>Rutas del periodo</h2>
            </div>
            <div className="tabla-envoltorio">
              <table className="tabla tabla-responsiva">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Vehículo</th>
                    <th>Conductor</th>
                    <th>Distancia</th>
                    <th>CO₂</th>
                    <th>Entregas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ind.rutas.map((r) => (
                    <tr key={r.id} className="fila-clic" onClick={() => navegar({ vista: 'rutas', accion: 'ver', id: r.id })}>
                      <td data-etiqueta="Fecha">
                        <div>
                          <div className="texto-principal">{formatearFechaCorta(r.fecha)}</div>
                          <div className="texto-secundario num">Salida {r.hora_salida}</div>
                        </div>
                      </td>
                      <td data-etiqueta="Vehículo" className="num">{r.placa ?? '—'}</td>
                      <td data-etiqueta="Conductor">{r.conductor ?? <span className="texto-secundario">Sin asignar</span>}</td>
                      <td data-etiqueta="Distancia" className="num">
                        <div>
                          {formatearNumero(r.km)} km
                          <div className="texto-secundario">antes {formatearNumero(r.km_sin_optimizar)} km</div>
                        </div>
                      </td>
                      <td data-etiqueta="CO₂" className="num">
                        <div>
                          {kg(r.co2_kg)}
                          <div className="texto-secundario">{conSigno(r.co2_evitado_kg, 'kg')}</div>
                        </div>
                      </td>
                      <td data-etiqueta="Entregas" className="num">
                        {r.entregadas || r.no_entregadas ? `${r.a_tiempo}/${r.entregadas} a tiempo${r.no_entregadas ? ` · ${r.no_entregadas} no` : ''}` : `${r.paradas} por entregar`}
                      </td>
                      <td data-etiqueta="Estado">
                        <BadgeEstadoRuta estado={r.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="ayuda">
            Estimaciones con las rutas no canceladas del periodo: litros = km × consumo del vehículo (L/100 km) ÷ 100; CO₂ = litros × factor de emisión
            (kg/L). &quot;Sin optimizar&quot; es el mismo recorrido en el orden en que se eligieron los pedidos. No incluyen pendientes, carga ni tráfico en
            tiempo real.
          </p>
        </div>
      )}
    </>
  )
}
