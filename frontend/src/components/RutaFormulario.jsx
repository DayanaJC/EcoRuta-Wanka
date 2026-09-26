import { useState } from 'react'
import { api } from '../services/api.js'
import { BadgeEstadoRuta } from './Badges.jsx'
import { ETIQUETAS_ESTADO_RUTA, formatearFecha } from '../utils/formatos.js'

export function RutaFormulario({ vehiculos, pedidosDisponibles, onGuardar, onVolver, cargando }) {
  const [vehiculoId, setVehiculoId] = useState('')
  const [pedidoIds, setPedidoIds] = useState([])
  const [error, setError] = useState('')

  const vehiculoSel = vehiculos.find((v) => v.id === vehiculoId)
  const pedidosSeleccionados = pedidosDisponibles.filter((p) =>
    pedidoIds.includes(p.id),
  )

  const togglePedido = (pedidoId) => {
    setPedidoIds((prev) =>
      prev.includes(pedidoId)
        ? prev.filter((id) => id !== pedidoId)
        : [...prev, pedidoId],
    )
  }

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    if (!vehiculoId) {
      setError('Selecciona un vehículo.')
      return
    }
    if (pedidoIds.length === 0) {
      setError('Selecciona al menos un pedido.')
      return
    }
    try {
      await onGuardar({ vehiculo_id: vehiculoId, pedido_ids: pedidoIds })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Generar nueva ruta</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <form className="formulario" onSubmit={enviar}>
        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Vehículo
            <select
              className="campo"
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              required
            >
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
        </div>

        <div className="campo-etiqueta">
          <label>Pedidos seleccionados</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {pedidosDisponibles.map((p) => (
              <label
                key={p.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={pedidoIds.includes(p.id)}
                  onChange={() => togglePedido(p.id)}
                />
                {p.cliente_nombre} ({p.peso_kg} kg)
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="aviso aviso-error" role="alert">
            {error}
          </div>
        )}

        <div className="acciones-formulario">
          <button className="boton boton-primario" type="submit">
            Generar ruta
          </button>
          <button className="boton boton-secundario" type="button" onClick={onVolver}>
            Cancelar
          </button>
        </div>
      </form>

      {pedidosSeleccionados.length > 0 && vehiculoSel && (
        <div className="tarjeta-detalle" style={{ marginTop: '16px' }}>
          <h3>Resumen</h3>
          <p className="detalle-fuerte">
            Vehículo: {vehiculoSel.placa} ({vehiculoSel.capacidad_carga_kg} kg)
          </p>
          <p className="detalle-suave">
            Pedidos: {pedidosSeleccionados.length} · Peso total:{' '}
            {pedidosSeleccionados.reduce((s, p) => s + p.peso_kg, 0)} kg
          </p>
        </div>
      )}
    </section>
  )
}

export function RutaDetalle({ ruta, onCambiarEstado, onVolver }) {
  const [estadoNuevo, setEstadoNuevo] = useState(ruta.estado)

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Detalle de la ruta</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver al listado
        </button>
      </div>

      <div className="detalle-mallas">
        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Ruta</h3>
            <p className="detalle-fuerte">ID: {ruta.id}</p>
            <p className="detalle-suave">
              Vehículo: {ruta.vehiculo_id}
            </p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Estado</h3>
            <p>
              <BadgeEstadoRuta estado={ruta.estado} />
            </p>
            <p className="detalle-suave">
              Creada: {formatearFecha(ruta.created_at)}
            </p>
          </div>
        </div>

        <div className="tarjeta-detalle">
          <h3>Pedidos incluidos</h3>
          {ruta.pedido_ids.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {ruta.pedido_ids.map((pid) => (
                <li key={pid}>{pid}</li>
              ))}
            </ul>
          ) : (
            <p className="detalle-suave">Sin pedidos asignados</p>
          )}
        </div>

        <div className="acciones-detalle">
          <label className="campo-etiqueta">
            Cambiar estado
            <select
              className="campo"
              value={estadoNuevo}
              onChange={(e) => setEstadoNuevo(e.target.value)}
            >
              {Object.entries(ETIQUETAS_ESTADO_RUTA).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
          <button
            className="boton boton-primario"
            type="button"
            onClick={() => onCambiarEstado(ruta.id, estadoNuevo)}
          >
            Aplicar estado
          </button>
        </div>
      </div>
    </section>
  )
}
