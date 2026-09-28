import { CircleCheck, Clock, ExternalLink, Gauge, MapPin, Play, Printer, Route, XCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { BadgeEstadoRuta } from './Badges.jsx'
import { Aviso } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'
import { capacidadVolumenM3 } from '../utils/carga.js'
import { enlacesGoogleMaps } from '../utils/googleMaps.js'
import {
  ETIQUETAS_TIPO_VEHICULO,
  formatearDuracion,
  formatearFechaCorta,
  formatearKg,
  formatearKm,
  formatearVentana,
  minutosEntre,
  sumarMinutos,
} from '../utils/formatos.js'

const MapaRuta = dynamic(() => import('./MapaRuta.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-ruta mapa-cargando">Cargando mapa…</div>,
})

// Acción principal según el estado de la ruta
const SIGUIENTE = {
  generada: { estado: 'en_reparto', texto: 'Iniciar reparto', icono: Play },
  en_reparto: { estado: 'completada', texto: 'Marcar completada', icono: CircleCheck },
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

export function RutaDetalle({ ruta, vehiculo, pedidosPorId, onCambiarEstado, onCancelar, gestionando }) {
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
            {siguiente && (
              <button type="button" className="boton boton-primario boton-sm" onClick={() => onCambiarEstado(siguiente.estado)} disabled={gestionando}>
                <siguiente.icono size={15} aria-hidden /> {siguiente.texto}
              </button>
            )}
          </div>
        </div>
      </div>

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
      </section>

      {ruta.estado === 'cancelada' && <Aviso tipo="info">Esta ruta fue cancelada.</Aviso>}

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
                    {p.espera_min > 0 && (
                      <div className="hito-detalle hito-espera">
                        Llega antes y espera {formatearDuracion(p.espera_min)} a que abra la ventana
                      </div>
                    )}
                  </div>
                </li>
              ))}
              <li className="hito hito-almacen">
                <span className="hito-hora">{regreso}</span>
                <span className="hito-marca">A</span>
                <div>
                  <div className="hito-titulo">Regreso al almacén</div>
                  <div className="hito-detalle">Fin estimado de la ruta</div>
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
