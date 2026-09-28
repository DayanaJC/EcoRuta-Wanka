import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { BadgeEstadoRuta } from './Badges.jsx'
import { ETIQUETAS_ESTADO_RUTA, formatearDuracion, formatearFecha, hoyEnLima } from '../utils/formatos.js'
import { enlacesGoogleMaps } from '../utils/googleMaps.js'

const MapaRuta = dynamic(() => import('./MapaRuta.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-ruta mapa-cargando">Cargando mapa…</div>,
})

export function RutaFormulario({ vehiculos, pedidosDisponibles, onGuardar, onVolver, cargando }) {
  const [vehiculoId, setVehiculoId] = useState('')
  const [pedidoIds, setPedidoIds] = useState([])
  const [fecha, setFecha] = useState(hoyEnLima)
  const [horaSalida, setHoraSalida] = useState('08:00')
  const [error, setError] = useState('')

  const vehiculoSel = vehiculos.find((v) => v.id === vehiculoId)
  const pedidosSeleccionados = pedidosDisponibles.filter((p) => pedidoIds.includes(p.id))
  const pesoTotal = pedidosSeleccionados.reduce((s, p) => s + p.peso_kg, 0)
  const excedeCapacidad = vehiculoSel && pesoTotal > vehiculoSel.capacidad_carga_kg

  const togglePedido = (pedidoId) => {
    setPedidoIds((prev) => (prev.includes(pedidoId) ? prev.filter((id) => id !== pedidoId) : [...prev, pedidoId]))
  }

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    if (!vehiculoId) return setError('Selecciona un vehículo.')
    if (pedidoIds.length === 0) return setError('Selecciona al menos un pedido.')
    try {
      await onGuardar({ vehiculo_id: vehiculoId, pedido_ids: pedidoIds, fecha, hora_salida: horaSalida })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Generar ruta optimizada</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <p className="detalle-suave">
        El orden de entrega se calcula con la API de optimización de rutas (OpenRouteService) considerando la capacidad del vehículo,
        las ventanas de entrega y el factor de tráfico de la hora de salida.
      </p>

      <form className="formulario" onSubmit={enviar}>
        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Vehículo
            <select className="campo" value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)} required>
              <option value="">Selecciona un vehículo…</option>
              {vehiculos
                .filter((v) => v.estado === 'activo')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} · {v.tipo} · {v.capacidad_carga_kg} kg
                  </option>
                ))}
            </select>
          </label>
          <label className="campo-etiqueta">
            Fecha
            <input className="campo" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </label>
          <label className="campo-etiqueta">
            Hora de salida del almacén
            <input className="campo" type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} required />
          </label>
        </div>

        <div className="campo-etiqueta">
          <span>Pedidos a entregar</span>
          {pedidosDisponibles.length === 0 && <p className="detalle-suave">No hay pedidos disponibles.</p>}
          <div className="lista-seleccion">
            {pedidosDisponibles.map((p) => (
              <label key={p.id} className="opcion-seleccion">
                <input type="checkbox" checked={pedidoIds.includes(p.id)} onChange={() => togglePedido(p.id)} />
                {p.cliente_nombre} ({p.peso_kg} kg · {p.ventana_entrega_inicio}–{p.ventana_entrega_fin})
              </label>
            ))}
          </div>
        </div>

        {pedidosSeleccionados.length > 0 && vehiculoSel && (
          <div className={excedeCapacidad ? 'aviso aviso-error' : 'tarjeta-detalle'}>
            Pedidos: {pedidosSeleccionados.length} · Peso total: {Number(pesoTotal.toFixed(2))} kg de {vehiculoSel.capacidad_carga_kg} kg
            {excedeCapacidad && ' — supera la capacidad del vehículo'}
          </div>
        )}

        {error && (
          <div className="aviso aviso-error" role="alert">
            {error}
          </div>
        )}

        <div className="acciones-formulario">
          <button className="boton boton-primario" type="submit" disabled={cargando}>
            {cargando ? 'Optimizando…' : 'Generar ruta optimizada'}
          </button>
          <button className="boton boton-secundario" type="button" onClick={onVolver}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export function RutaDetalle({ ruta: resumen, pedidos, vehiculos, onCambiarEstado, onVolver }) {
  const [ruta, setRuta] = useState(resumen)
  const [estadoNuevo, setEstadoNuevo] = useState(resumen.estado)
  const [error, setError] = useState('')

  // El listado no trae el trazado del mapa: se pide el detalle completo
  useEffect(() => {
    let activo = true
    api
      .obtenerRuta(resumen.id)
      .then((r) => activo && setRuta(r))
      .catch((e) => activo && setError(e.message))
    return () => {
      activo = false
    }
  }, [resumen.id])

  const vehiculo = vehiculos.find((v) => v.id === ruta.vehiculo_id)
  const pedidoPorId = Object.fromEntries(pedidos.map((p) => [p.id, p]))
  const paradas = (ruta.paradas ?? []).map((p) => ({ ...p, ...pedidoPorId[p.pedido_id], orden: p.orden }))
  const paradasConUbicacion = paradas.filter((p) => p.latitud !== undefined)
  // El trazado empieza en el almacén: sirve de origen y destino en Google Maps
  const enlacesGoogle =
    paradasConUbicacion.length === paradas.length ? enlacesGoogleMaps(ruta.geometria?.[0], paradasConUbicacion) : []

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Detalle de la ruta</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver al listado
        </button>
      </div>

      {error && (
        <div className="aviso aviso-error" role="alert">
          {error}
        </div>
      )}

      <div className="detalle-mallas">
        <div className="resumen-ruta">
          <div className="tarjeta-detalle">
            <h3>Vehículo</h3>
            <p className="detalle-fuerte">{vehiculo ? `${vehiculo.placa} · ${vehiculo.tipo}` : ruta.vehiculo_id}</p>
            <p className="detalle-suave">
              {ruta.fecha} · salida {ruta.hora_salida}
            </p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Distancia</h3>
            <p className="detalle-fuerte">{ruta.distancia_estimada_km ?? '—'} km</p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Tiempo estimado</h3>
            <p className="detalle-fuerte">{formatearDuracion(ruta.tiempo_estimado_min)}</p>
            <p className="detalle-suave">Factor de tráfico: {ruta.factor_trafico_aplicado ?? '—'}</p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Estado</h3>
            <p>
              <BadgeEstadoRuta estado={ruta.estado} />
            </p>
            <p className="detalle-suave">Creada: {formatearFecha(ruta.created_at)}</p>
          </div>
        </div>

        {ruta.geometria !== undefined && <MapaRuta geometria={ruta.geometria} paradas={paradasConUbicacion} />}

        {enlacesGoogle.length > 0 && (
          <div className="tarjeta-detalle google-maps">
            <h3>Ver en Google Maps</h3>
            <div className="acciones">
              {enlacesGoogle.map((e) => (
                <a key={e.url} className="boton boton-secundario" href={e.url} target="_blank" rel="noopener noreferrer">
                  {e.etiqueta} ↗
                </a>
              ))}
            </div>
            <p className="detalle-suave">
              Abre la ruta con el mismo orden de entrega en Google Maps; en el celular del conductor abre la app con navegación paso a paso.
              Google calcula su propio camino entre paradas, por lo que la distancia puede variar un poco.
              {enlacesGoogle.length > 1 && ' Google Maps admite 9 paradas por enlace, por eso la ruta se divide en tramos.'}
            </p>
          </div>
        )}

        <div className="tarjeta-detalle">
          <h3>Orden de entrega</h3>
          {paradas.length > 0 ? (
            <ol className="lista-paradas">
              {paradas.map((p) => (
                <li key={p.orden}>
                  <strong>{p.hora_estimada_llegada ?? '—'}</strong> · {p.cliente_nombre ?? p.pedido_id}
                  {p.direccion && <span className="detalle-suave"> — {p.direccion}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="detalle-suave">Sin pedidos asignados</p>
          )}
          <p className="detalle-suave">
            Horas estimadas de entrega: si el vehículo llega antes de que abra la ventana del cliente, espera. Los tiempos incluyen el
            factor de tráfico y son estimaciones.
          </p>
        </div>

        <div className="acciones-detalle">
          <label className="campo-etiqueta">
            Cambiar estado
            <select className="campo" value={estadoNuevo} onChange={(e) => setEstadoNuevo(e.target.value)}>
              {Object.entries(ETIQUETAS_ESTADO_RUTA).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
          <button className="boton boton-primario" type="button" onClick={() => onCambiarEstado(ruta.id, estadoNuevo)}>
            Aplicar estado
          </button>
        </div>
      </div>
    </section>
  )
}
