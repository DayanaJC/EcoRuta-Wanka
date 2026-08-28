import { useState } from 'react'
import { ETIQUETAS_TIPO_VEHICULO } from '../utils/formatos.js'

const PUNTO_PARTIDA_DEFECTO = { latitud: -12.0664, longitud: -75.2089 }

function tieneCoordenadas(pedido) {
  const numero = (valor) =>
    valor !== null && valor !== undefined && valor !== '' && Number.isFinite(Number(valor))
  const lat = numero(pedido.latitud) ? Number(pedido.latitud) : null
  const lon = numero(pedido.longitud) ? Number(pedido.longitud) : null
  return lat !== null && lon !== null && !(lat === 0 && lon === 0)
}

export function RutaFormulario({
  vehiculos,
  asignaciones,
  mapaPedidos,
  onGenerar,
  onVolver,
  generando,
}) {
  const [vehiculoId, setVehiculoId] = useState('')
  const [latitudInicio, setLatitudInicio] = useState('')
  const [longitudInicio, setLongitudInicio] = useState('')

  const vehiculo = vehiculos.find((v) => v.id === vehiculoId)
  const pedidosAsignados = vehiculoId
    ? asignaciones
        .filter(
          (a) =>
            a.vehiculo_id === vehiculoId &&
            a.estado === 'asignada' &&
            mapaPedidos[a.pedido_id] &&
            mapaPedidos[a.pedido_id].estado !== 'entregado' &&
            mapaPedidos[a.pedido_id].estado !== 'cancelado',
        )
        .map((a) => mapaPedidos[a.pedido_id])
    : []

  const usarDefecto = !latitudInicio.trim() && !longitudInicio.trim()

  const enviar = (e) => {
    e.preventDefault()
    const payload = { vehiculo_id: vehiculoId }
    if (!usarDefecto) {
      payload.latitud_inicio = Number(latitudInicio)
      payload.longitud_inicio = Number(longitudInicio)
    }
    onGenerar(payload)
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Nueva ruta optimizada</h2>
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
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} · {ETIQUETAS_TIPO_VEHICULO[v.tipo] || v.tipo}
                </option>
              ))}
            </select>
          </label>
          <div className="campo-etiqueta">
            Punto de partida
            <span className="texto-secundario">
              Vacío = punto por defecto (Huancayo {PUNTO_PARTIDA_DEFECTO.latitud},{' '}
              {PUNTO_PARTIDA_DEFECTO.longitud})
            </span>
          </div>
        </div>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Latitud inicio (opcional)
            <input
              className="campo"
              type="number"
              step="any"
              value={latitudInicio}
              onChange={(e) => setLatitudInicio(e.target.value)}
              placeholder={PUNTO_PARTIDA_DEFECTO.latitud}
            />
          </label>
          <label className="campo-etiqueta">
            Longitud inicio (opcional)
            <input
              className="campo"
              type="number"
              step="any"
              value={longitudInicio}
              onChange={(e) => setLongitudInicio(e.target.value)}
              placeholder={PUNTO_PARTIDA_DEFECTO.longitud}
            />
          </label>
        </div>

        <div className="tarjeta-detalle">
          <h3>Pedidos asignados ({pedidosAsignados.length})</h3>
          {pedidosAsignados.length === 0 ? (
            <p className="detalle-suave">
              Selecciona un vehículo para ver sus pedidos asignados.
            </p>
          ) : (
            <ul className="lista-excluidos">
              {pedidosAsignados.map((p) => (
                <li key={p.id} className="parada-item">
                  <span className="parada-contenido">
                    <span className="parada-titulo">
                      <span className="texto-principal">{p.cliente_nombre}</span>
                    </span>
                    <span className="parada-direccion">{p.direccion}</span>
                    <span className="parada-datos">
                      <span>{p.peso_kg} kg</span>
                      <span>
                        Ventana: {p.ventana_entrega_inicio}–{p.ventana_entrega_fin}
                      </span>
                      <span>
                        {tieneCoordenadas(p) ? 'Con ubicación' : 'Sin coordenadas'}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {vehiculo && (
          <p className="aviso aviso-info">
            La ruta se generará con {pedidosAsignados.length} pedidos asignados. Los que no
            tengan coordenadas o no estén en estado entregable quedarán excluidos de la ruta.
          </p>
        )}

        <div className="acciones-formulario">
          <button className="boton boton-primario" type="submit" disabled={generando || !vehiculoId}>
            {generando ? 'Generando ruta…' : 'Generar ruta'}
          </button>
          <button
            className="boton boton-secundario"
            type="button"
            onClick={onVolver}
            disabled={generando}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}