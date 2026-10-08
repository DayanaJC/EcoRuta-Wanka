import { CircleCheck, Clock, ExternalLink, FlaskConical, Gauge, MapPin, PackageX, Play, Printer, Route, Timer, XCircle } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { BadgeEstadoParada, BadgeEstadoRuta } from './Badges.jsx'
import { AntesDespues } from './AntesDespues.jsx'
import { ConductorRuta } from './ConductorRuta.jsx'
import { Aviso } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'
import { capacidadVolumenM3 } from '../utils/carga.js'
import { enlacesGoogleMaps } from '../utils/googleMaps.js'
import {
  ETIQUETAS_REGISTRADO_POR,
  ETIQUETAS_TIPO_VEHICULO,
  formatearDuracion,
  formatearHora,
  formatearFechaCorta,
  formatearKg,
  formatearKm,
  formatearVentana,
  minutosEntre,
  puntualidad,
  sumarMinutos,
} from '../utils/formatos.js'

const MapaRuta = dynamic(() => import('./MapaRuta.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-ruta mapa-cargando">Cargando mapa…</div>,
})

// Acción principal según el estado de la ruta. "Completada" no se marca a mano:
// la ruta se completa sola cuando se registra la última parada.
const SIGUIENTE = {
  generada: { estado: 'en_reparto', texto: 'Iniciar reparto', icono: Play },
}

// Botones de una parada pendiente: entregada, o no entregada con motivo
function AccionesParada({ parada, onRegistrar, gestionando }) {
  const [motivo, setMotivo] = useState(null)
  if (motivo !== null) {
    return (
      <form
        className="acciones no-imprimir"
        style={{ marginTop: 8, flexWrap: 'wrap' }}
        onSubmit={(e) => {
          e.preventDefault()
          onRegistrar(parada.orden, { resultado: 'no_entregada', motivo: motivo.trim() })
        }}
      >
        <input
          className="campo"
          style={{ maxWidth: 260 }}
          placeholder="Motivo (ej. cliente ausente)"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          minLength={3}
          maxLength={200}
          required
          autoFocus
          aria-label={`Motivo de no entrega de la parada ${parada.orden}`}
        />
        <button type="submit" className="boton boton-peligro boton-sm" disabled={gestionando}>
          Confirmar
        </button>
        <button type="button" className="boton boton-secundario boton-sm" onClick={() => setMotivo(null)}>
          Volver
        </button>
      </form>
    )
  }
  return (
    <div className="acciones no-imprimir" style={{ marginTop: 8 }}>
      <button type="button" className="boton boton-primario boton-sm" onClick={() => onRegistrar(parada.orden, { resultado: 'entregada' })} disabled={gestionando}>
        <CircleCheck size={15} aria-hidden /> Entregado
      </button>
      <button type="button" className="boton boton-secundario boton-sm" onClick={() => setMotivo('')} disabled={gestionando}>
        <PackageX size={15} aria-hidden /> No entregado
      </button>
    </div>
  )
}

// Minutos entre dos instantes ISO
const minutosReales = (desde, hasta) => Math.round((new Date(hasta) - new Date(desde)) / 60000)

// Diferencia entre la hora real de entrega y la planificada (hora estimada + tiempo de atención)
function Desfase({ parada }) {
  if (!parada.hora_estimada_llegada || !parada.entregado_at) return null
  const planificada = sumarMinutos(parada.hora_estimada_llegada, parada.tiempo_servicio_min ?? 5)
  const d = minutosEntre(planificada, formatearHora(parada.entregado_at))
  const texto = Math.abs(d) <= 2 ? 'según lo planificado' : `${d > 0 ? '+' : '−'}${formatearDuracion(Math.abs(d))} respecto a lo planificado (${planificada})`
  return <span className="texto-secundario"> ({texto})</span>
}

// Resultado registrado de una parada: hora real y si cayó en la ventana del cliente
function ResultadoParada({ parada }) {
  if (parada.estado === 'entregada') {
    const sinHora = !parada.entregado_at
    return (
      <div className="hito-detalle hito-resultado">
        <BadgeEstadoParada estado="entregada" />{' '}
        {sinHora ? (
          'sin hora registrada'
        ) : (
          <>
            a las <strong className="num">{formatearHora(parada.entregado_at)}</strong>
            <Desfase parada={parada} /> ·{' '}
            {parada.dentro_ventana ? (
              <span className="texto-verde">dentro de la ventana</span>
            ) : (
              <span className="texto-rojo">fuera de la ventana</span>
            )}
          </>
        )}
        {parada.registrado_por && ` · ${ETIQUETAS_REGISTRADO_POR[parada.registrado_por] ?? parada.registrado_por}`}
      </div>
    )
  }
  if (parada.estado === 'no_entregada') {
    return (
      <div className="hito-detalle hito-resultado">
        <BadgeEstadoParada estado="no_entregada" /> {parada.motivo_no_entrega}
        {parada.registrado_por && ` · ${ETIQUETAS_REGISTRADO_POR[parada.registrado_por] ?? parada.registrado_por}`}
      </div>
    )
  }
  return null
}

function Kpi({ icono: Icono, etiqueta, valor, extra }) {
  return (
    <div className="tarjeta indicador">
      <div className="indicador-icono tono-gris">
        <Icono size={18} aria-hidden />
      </div>
      <div>
        <div className="indicador-valor num" style={{ fontSize: '1.25rem' }}>
          {valor}
        </div>
        <div className="indicador-etiqueta">{etiqueta}</div>
        {extra && <div className="indicador-extra">{extra}</div>}
      </div>
    </div>
  )
}

export function RutaDetalle({
  ruta,
  vehiculo,
  pedidosPorId,
  conductores,
  rutas,
  onCambiarEstado,
  onCancelar,
  onRegistrarEntrega,
  onSimular,
  onAsignarConductor,
  gestionando,
}) {
  const [imprevistos, setImprevistos] = useState(false)
  const paradas = (ruta.paradas ?? []).map((p) => ({ ...pedidosPorId[p.pedido_id], ...p }))
  const conUbicacion = paradas.filter((p) => p.latitud !== undefined)
  const almacen = ruta.geometria?.[0]
  const enlacesGoogle = conUbicacion.length === paradas.length ? enlacesGoogleMaps(almacen, conUbicacion) : []
  const regreso = sumarMinutos(ruta.hora_salida, ruta.tiempo_estimado_min)
  const carga = paradas.reduce((s, p) => s + (p.peso_kg ?? 0), 0)
  const siguiente = SIGUIENTE[ruta.estado]
  const volumen = paradas.reduce((s, p) => s + (p.volumen_m3 ?? 0), 0)
  const usoPeso = vehiculo?.capacidad_carga_kg ? Math.round((carga / vehiculo.capacidad_carga_kg) * 100) : null
  const usoVolumen = vehiculo ? Math.round((volumen / capacidadVolumenM3(vehiculo)) * 100) : null
  const finalizada = ruta.estado === 'completada' || ruta.estado === 'cancelada'
  const ajustada = ruta.hora_disponible && ruta.hora_disponible !== ruta.hora_salida
  const esperaTotal = paradas.reduce((s, p) => s + (p.espera_min ?? 0), 0)
  const activa = ruta.estado === 'generada' || ruta.estado === 'en_reparto'
  const resueltas = paradas.filter((p) => p.estado && p.estado !== 'pendiente').length
  const kpiPuntualidad = puntualidad([ruta])

  return (
    <div className="pila">
      <div className="solo-impresion">
        <strong>EcoRuta Wanka · Hoja de ruta</strong> — WankaLogística S.A.C.
      </div>

      <div className="tarjeta" style={{ padding: '14px 18px' }}>
        <div className="acciones" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div className="acciones">
            <BadgeEstadoRuta estado={ruta.estado} />
            {vehiculo && (
              <span className="acciones texto-secundario">
                <IconoVehiculo tipo={vehiculo.tipo} /> {vehiculo.placa} · {ETIQUETAS_TIPO_VEHICULO[vehiculo.tipo]} · capacidad {formatearKg(vehiculo.capacidad_carga_kg)}
              </span>
            )}
          </div>
          <div className="acciones no-imprimir">
            {enlacesGoogle.map((e) => (
              <a key={e.url} className="boton boton-secundario boton-sm" href={e.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={15} aria-hidden /> {enlacesGoogle.length === 1 ? 'Google Maps' : e.etiqueta}
              </a>
            ))}
            <button type="button" className="boton boton-secundario boton-sm" onClick={() => window.print()}>
              <Printer size={15} aria-hidden /> Imprimir hoja de ruta
            </button>
            {!finalizada && (
              <button type="button" className="boton boton-peligro boton-sm" onClick={onCancelar} disabled={gestionando}>
                <XCircle size={15} aria-hidden /> Cancelar
              </button>
            )}
            {activa && (
              <span className="acciones simulador">
                <label className="texto-secundario" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={imprevistos} onChange={(e) => setImprevistos(e.target.checked)} /> con imprevistos
                </label>
                <button
                  type="button"
                  className="boton boton-secundario boton-sm"
                  onClick={() => onSimular({ imprevistos, probabilidad_no_entrega: imprevistos ? 0.15 : 0 })}
                  disabled={gestionando}
                  title="Recorre la ruta tramo a tramo: manejo con tráfico, espera de ventana y tiempo de atención en cada cliente"
                >
                  <FlaskConical size={15} aria-hidden /> Simular reparto
                </button>
              </span>
            )}
            {siguiente && (
              <button type="button" className="boton boton-primario boton-sm" onClick={() => onCambiarEstado(siguiente.estado)} disabled={gestionando}>
                <siguiente.icono size={15} aria-hidden /> {siguiente.texto}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConductorRuta ruta={ruta} conductores={conductores} rutas={rutas} onAsignar={onAsignarConductor} gestionando={gestionando} />

      <section className="indicadores" style={{ marginBottom: 0 }} aria-label="Resumen de la ruta">
        <Kpi icono={MapPin} etiqueta="Paradas" valor={paradas.length} extra={`Carga ${formatearKg(carga)}`} />
        <Kpi icono={Route} etiqueta="Distancia" valor={formatearKm(ruta.distancia_estimada_km)} />
        <Kpi
          icono={Clock}
          etiqueta="Duración total"
          valor={formatearDuracion(ruta.tiempo_estimado_min)}
          extra={`${ruta.hora_salida} → ${regreso}${esperaTotal ? ` · incluye ${formatearDuracion(esperaTotal)} de espera` : ''}`}
        />
        <Kpi
          icono={Gauge}
          etiqueta="Uso de capacidad"
          valor={usoPeso != null ? `${usoPeso} % · ${usoVolumen} %` : '—'}
          extra={vehiculo ? `peso de ${formatearKg(vehiculo.capacidad_carga_kg)} · volumen de ${Number(capacidadVolumenM3(vehiculo).toFixed(2)).toLocaleString('es-PE')} m³` : undefined}
        />
        {(ruta.estado === 'en_reparto' || ruta.estado === 'completada') && (
          <Kpi
            icono={Timer}
            etiqueta="Entregas a tiempo"
            valor={kpiPuntualidad.pct != null ? `${kpiPuntualidad.pct} %` : '—'}
            extra={`${kpiPuntualidad.aTiempo} de ${kpiPuntualidad.total} dentro de la ventana · ${resueltas}/${paradas.length} paradas resueltas${
              kpiPuntualidad.noEntregadas ? ` · ${kpiPuntualidad.noEntregadas} no entregada(s)` : ''
            }`}
          />
        )}
      </section>

      {ruta.estado === 'en_reparto' && (
        <Aviso tipo="info">
          Reparto en curso{ruta.iniciada_at ? ` desde las ${formatearHora(ruta.iniciada_at)}` : ''}. Registra cada parada como entregada o no
          entregada: la hora se guarda sola y la ruta se completa al resolver la última.
        </Aviso>
      )}
      {ruta.estado === 'completada' && ruta.completada_at && (
        <Aviso tipo="info">
          Reparto completado a las {formatearHora(ruta.completada_at)}
          {ruta.iniciada_at ? ` (inició a las ${formatearHora(ruta.iniciada_at)})` : ''}.
          {ruta.regreso_at && (
            <>
              {' '}
              Regresó al almacén a las <strong>{formatearHora(ruta.regreso_at)}</strong>
              {ruta.iniciada_at &&
                ` · duración real ${formatearDuracion(minutosReales(ruta.iniciada_at, ruta.regreso_at))} (planificada ${formatearDuracion(ruta.tiempo_estimado_min)})`}
              .
            </>
          )}
        </Aviso>
      )}

      {ruta.estado === 'cancelada' && <Aviso tipo="info">Esta ruta fue cancelada.</Aviso>}

      <AntesDespues ruta={ruta} vehiculo={vehiculo} />

      {ajustada && (
        <Aviso tipo="info">
          <strong>Salida ajustada a las {ruta.hora_salida}</strong> (disponible desde las {ruta.hora_disponible}): se evitan{' '}
          {formatearDuracion(minutosEntre(ruta.hora_disponible, ruta.hora_salida))} de espera. Las entregas se programan con un margen de
          seguridad antes del cierre de cada ventana.
        </Aviso>
      )}

      <div className="detalle-ruta">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Orden de entrega</h2>
            <span className="texto-secundario">{formatearFechaCorta(ruta.fecha)}</span>
          </div>
          <div className="tarjeta-cuerpo">
            <ol className="linea-tiempo">
              <li className="hito hito-almacen">
                <span className="hito-hora">{ruta.hora_salida}</span>
                <span className="hito-marca">A</span>
                <div>
                  <div className="hito-titulo">Salida del almacén</div>
                  <div className="hito-detalle">
                    Carga total {formatearKg(carga)}
                    {ajustada && ` · disponible desde ${ruta.hora_disponible}`}
                  </div>
                </div>
              </li>
              {paradas.map((p) => (
                <li key={p.orden} className="hito">
                  <span className="hito-hora">{p.hora_estimada_llegada ?? '—'}</span>
                  <span className="hito-marca">{p.orden}</span>
                  <div>
                    <div className="hito-titulo">{p.cliente_nombre ?? 'Pedido'}</div>
                    <div className="hito-detalle">{p.direccion}</div>
                    {p.peso_kg !== undefined && (
                      <div className="hito-detalle num">
                        {formatearKg(p.peso_kg)} · {Number((p.volumen_m3 ?? 0).toFixed(3)).toLocaleString('es-PE')} m³ ·{' '}
                        {(p.bultos ?? []).reduce((s, b) => s + b.cantidad, 0)} bulto(s) · ventana {formatearVentana(p)}
                        {p.punto_referencia && ` · ${p.punto_referencia}`}
                      </div>
                    )}
                    {(p.bultos ?? []).some((b) => !b.apilable) && (
                      <div className="hito-detalle hito-espera">
                        No poner carga encima de: {(p.bultos ?? []).filter((b) => !b.apilable).map((b) => b.descripcion).join(', ')}
                      </div>
                    )}
                    {p.espera_min > 0 && (!p.estado || p.estado === 'pendiente') && (
                      <div className="hito-detalle hito-espera">
                        Llega antes y espera {formatearDuracion(p.espera_min)} a que abra la ventana
                      </div>
                    )}
                    <ResultadoParada parada={p} />
                    {ruta.estado === 'en_reparto' && (!p.estado || p.estado === 'pendiente') && (
                      <AccionesParada parada={p} onRegistrar={onRegistrarEntrega} gestionando={gestionando} />
                    )}
                  </div>
                </li>
              ))}
              <li className="hito hito-almacen">
                <span className="hito-hora">{regreso}</span>
                <span className="hito-marca">A</span>
                <div>
                  <div className="hito-titulo">Regreso al almacén</div>
                  {ruta.regreso_at ? (
                    <div className="hito-detalle hito-resultado">
                      Llegó a las <strong className="num">{formatearHora(ruta.regreso_at)}</strong>
                      <span className="texto-secundario">
                        {' '}
                        ({Math.abs(minutosEntre(regreso, formatearHora(ruta.regreso_at))) <= 2
                          ? 'según lo planificado'
                          : `${minutosEntre(regreso, formatearHora(ruta.regreso_at)) > 0 ? '+' : '−'}${formatearDuracion(
                              Math.abs(minutosEntre(regreso, formatearHora(ruta.regreso_at))),
                            )} respecto a lo planificado`}
                        )
                      </span>
                      {ruta.completada_at && ` · tramo de regreso ${formatearDuracion(minutosReales(ruta.completada_at, ruta.regreso_at))}`}
                    </div>
                  ) : (
                    <div className="hito-detalle">Fin estimado de la ruta</div>
                  )}
                </div>
              </li>
            </ol>
            <p className="ayuda" style={{ marginTop: 16 }}>
              Horas estimadas de entrega. Si el vehículo llega antes de que abra la ventana del cliente, espera. Los tiempos son estimaciones
              con las velocidades promedio de las vías; no consideran el tráfico en tiempo real.
            </p>
          </div>
        </section>

        {ruta.geometria !== undefined ? (
          <MapaRuta geometria={ruta.geometria} paradas={conUbicacion} />
        ) : (
          <div className="mapa-ruta mapa-cargando">Cargando mapa…</div>
        )}
      </div>
    </div>
  )
}
