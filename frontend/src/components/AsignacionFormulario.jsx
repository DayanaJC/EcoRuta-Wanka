import { useState } from 'react'
import { ETIQUETAS_TIPO_VEHICULO } from '../utils/formatos.js'

export function AsignacionFormulario({
  pedidosDisponibles,
  vehiculosActivos,
  onAsignar,
  onVolver,
  asignando,
}) {
  const [pedidoId, setPedidoId] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')

  const pedidoSel = pedidosDisponibles.find((p) => p.id === pedidoId)
  const vehiculoSel = vehiculosActivos.find((v) => v.id === vehiculoId)
  const excede =
    pedidoSel && vehiculoSel && pedidoSel.peso_kg > vehiculoSel.capacidad_carga_kg

  const enviar = (e) => {
    e.preventDefault()
    onAsignar({ pedido_id: pedidoId, vehiculo_id: vehiculoId })
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Nueva asignación</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <form className="formulario" onSubmit={enviar}>
        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Pedido
            <select
              className="campo"
              value={pedidoId}
              onChange={(e) => setPedidoId(e.target.value)}
              required
            >
              <option value="">Selecciona un pedido…</option>
              {pedidosDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.cliente_nombre} · {p.peso_kg} kg
                </option>
              ))}
            </select>
          </label>
          <label className="campo-etiqueta">
            Vehículo
            <select
              className="campo"
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              required
            >
              <option value="">Selecciona un vehículo…</option>
              {vehiculosActivos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} · {ETIQUETAS_TIPO_VEHICULO[v.tipo] || v.tipo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Pedido</h3>
            {pedidoSel ? (
              <>
                <p className="detalle-fuerte">{pedidoSel.cliente_nombre}</p>
                <p className="detalle-suave">
                  Peso: {pedidoSel.peso_kg} kg · Volumen: {pedidoSel.volumen_m3} m³
                </p>
                <p className="detalle-suave">
                  Ventana: {pedidoSel.ventana_entrega_inicio}–{pedidoSel.ventana_entrega_fin}
                </p>
              </>
            ) : (
              <p className="detalle-suave">Selecciona un pedido disponible.</p>
            )}
          </div>
          <div className="tarjeta-detalle">
            <h3>Vehículo</h3>
            {vehiculoSel ? (
              <>
                <p className="detalle-fuerte">{vehiculoSel.placa}</p>
                <p className="detalle-suave">
                  Capacidad: {vehiculoSel.capacidad_carga_kg} kg
                </p>
                <p className="detalle-suave">
                  Tipo: {ETIQUETAS_TIPO_VEHICULO[vehiculoSel.tipo] || vehiculoSel.tipo}
                </p>
              </>
            ) : (
              <p className="detalle-suave">Selecciona un vehículo activo.</p>
            )}
          </div>
        </div>

        {excede && (
          <p className="aviso aviso-error" role="alert">
            El pedido pesa {pedidoSel.peso_kg} kg y el vehículo solo soporta{' '}
            {vehiculoSel.capacidad_carga_kg} kg. La asignación será rechazada.
          </p>
        )}

        <div className="acciones-formulario">
          <button className="boton boton-primario" type="submit" disabled={asignando}>
            {asignando ? 'Asignando…' : 'Asignar pedido'}
          </button>
          <button
            className="boton boton-secundario"
            type="button"
            onClick={onVolver}
            disabled={asignando}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}