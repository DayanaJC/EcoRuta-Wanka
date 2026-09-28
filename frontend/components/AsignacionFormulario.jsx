import { useState } from 'react'
import { ETIQUETAS_TIPO_VEHICULO, formatearKg, formatearVentana } from '../utils/formatos.js'
import { Aviso, Cargando, CampoGrupo, MedidorCapacidad } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'

export function AsignacionFormulario({ pedidosDisponibles, vehiculosActivos, cargaAsignada, onAsignar, onCancelar, asignando }) {
  const [pedidoId, setPedidoId] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')
  const pedido = pedidosDisponibles.find((p) => p.id === pedidoId)
  const vehiculo = vehiculosActivos.find((v) => v.id === vehiculoId)
  const cargaActual = vehiculo ? (cargaAsignada[vehiculo.id] ?? 0) : 0

  const enviar = (e) => {
    e.preventDefault()
    onAsignar({ pedido_id: pedidoId, vehiculo_id: vehiculoId })
  }

  if (pedidosDisponibles.length === 0) {
    return <Aviso tipo="info">No hay pedidos pendientes sin asignar. Registra un pedido nuevo o libera una asignación existente.</Aviso>
  }

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <div className="tarjeta-cuerpo formulario">
        <fieldset className="seccion-form">
          <legend>Pedido</legend>
          <CampoGrupo etiqueta="Pedido pendiente" requerido htmlFor="pedido">
            <select id="pedido" className="campo" value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} required>
              <option value="">Selecciona un pedido…</option>
              {pedidosDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.cliente_nombre} · {formatearKg(p.peso_kg)} · {formatearVentana(p)}
                </option>
              ))}
            </select>
          </CampoGrupo>
          {pedido && (
            <p className="ayuda">
              {pedido.direccion} {pedido.punto_referencia && `· ${pedido.punto_referencia}`}
            </p>
          )}
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Vehículo
            <small>Solo se muestran vehículos activos.</small>
          </legend>
          <div className="opciones-tarjeta" role="group" aria-label="Vehículo">
            {vehiculosActivos.map((v) => (
              <button key={v.id} type="button" className="opcion-tarjeta" aria-pressed={vehiculoId === v.id} onClick={() => setVehiculoId(v.id)}>
                <strong className="num">
                  <IconoVehiculo tipo={v.tipo} /> {v.placa}
                </strong>
                <span>
                  {ETIQUETAS_TIPO_VEHICULO[v.tipo]} · {formatearKg(v.capacidad_carga_kg)}
                </span>
              </button>
            ))}
          </div>
          {pedido && vehiculo && (
            <>
              <MedidorCapacidad usado={cargaActual + pedido.peso_kg} capacidad={vehiculo.capacidad_carga_kg} />
              <span className="ayuda">
                Incluye {formatearKg(cargaActual)} ya asignados a este vehículo.
                {pedido.peso_kg > vehiculo.capacidad_carga_kg && ' El pedido por sí solo supera la capacidad: la asignación será rechazada.'}
              </span>
            </>
          )}
        </fieldset>
      </div>
      <div className="barra-acciones">
        <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={asignando}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={asignando || !pedidoId || !vehiculoId}>
          {asignando ? <Cargando texto="Asignando" /> : 'Asignar pedido'}
        </button>
      </div>
    </form>
  )
}
