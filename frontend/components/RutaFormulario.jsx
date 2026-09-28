import { Search } from 'lucide-react'
import { useState } from 'react'
import { BadgePrioridad } from './Badges.jsx'
import { Aviso, Cargando, CampoGrupo, MedidorCapacidad } from './ui.jsx'
import { bultosQueNoCaben, capacidadVolumenM3, medidasBulto } from '../utils/carga.js'
import { IconoVehiculo } from './VehiculoLista.jsx'
import { ETIQUETAS_TIPO_VEHICULO, formatearKg, formatearVentana, hoyEnLima, normalizar } from '../utils/formatos.js'

/**
 * @param pedidosDisponibles pedidos que pueden incluirse (no terminales ni en otra ruta activa)
 * @param asignacionPorPedido pedido_id -> vehiculo_id de la asignación activa
 */
export function RutaFormulario({ vehiculos, pedidosDisponibles, asignacionPorPedido, onGenerar, onCancelar, generando }) {
  const [vehiculoId, setVehiculoId] = useState('')
  const [fecha, setFecha] = useState(hoyEnLima)
  const [horaSalida, setHoraSalida] = useState('08:00')
  const [salidaFija, setSalidaFija] = useState(false)
  const [seleccion, setSeleccion] = useState(() => new Set())
  const [busqueda, setBusqueda] = useState('')

  const vehiculo = vehiculos.find((v) => v.id === vehiculoId)
  // Pedidos asignados a otro vehículo no se ofrecen para este
  const opciones = pedidosDisponibles.filter((p) => !asignacionPorPedido[p.id] || asignacionPorPedido[p.id] === vehiculoId)
  const texto = normalizar(busqueda.trim())
  const visibles = opciones.filter((p) => !texto || normalizar(`${p.cliente_nombre} ${p.direccion}`).includes(texto))
  const seleccionados = opciones.filter((p) => seleccion.has(p.id))
  const peso = seleccionados.reduce((s, p) => s + p.peso_kg, 0)
  const volumen = seleccionados.reduce((s, p) => s + p.volumen_m3, 0)
  const volumenMax = vehiculo ? capacidadVolumenM3(vehiculo) : 0
  const excede = vehiculo && (peso > vehiculo.capacidad_carga_kg || volumen > volumenMax)
  // Pedidos con algún bulto que no entra físicamente en el vehículo elegido
  const noCaben = vehiculo ? Object.fromEntries(opciones.map((p) => [p.id, bultosQueNoCaben(p, vehiculo)]).filter(([, b]) => b.length)) : {}

  const elegirVehiculo = (v) => {
    setVehiculoId(v.id)
    // Preseleccionar los pedidos ya asignados a este vehículo; quitar los que no caben en él
    setSeleccion((prev) => {
      const s = new Set([...prev, ...pedidosDisponibles.filter((p) => asignacionPorPedido[p.id] === v.id).map((p) => p.id)])
      pedidosDisponibles.forEach((p) => bultosQueNoCaben(p, v).length && s.delete(p.id))
      return s
    })
  }

  const alternar = (id) =>
    !noCaben[id] &&
    setSeleccion((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })

  const todosVisibles = visibles.some((p) => !noCaben[p.id]) && visibles.filter((p) => !noCaben[p.id]).every((p) => seleccion.has(p.id))
  const alternarTodos = () =>
    setSeleccion((prev) => {
      const s = new Set(prev)
      visibles.filter((p) => !noCaben[p.id]).forEach((p) => (todosVisibles ? s.delete(p.id) : s.add(p.id)))
      return s
    })

  const motivoBloqueo = !vehiculo ? 'Elige un vehículo.' : seleccionados.length === 0 ? 'Selecciona al menos un pedido.' : excede ? 'La carga supera la capacidad.' : null

  const enviar = (e) => {
    e.preventDefault()
    if (motivoBloqueo) return
    onGenerar({ vehiculo_id: vehiculoId, pedido_ids: seleccionados.map((p) => p.id), fecha, hora_salida: horaSalida, ajustar_salida: !salidaFija })
  }

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <div className="tarjeta-cuerpo formulario">
        <fieldset className="seccion-form">
          <legend>
            1. Vehículo y horario
            <small>El vehículo sale del almacén y regresa al terminar. Si algún cliente abre más tarde, el sistema retrasa la salida para no esperar en la calle.</small>
          </legend>
          {vehiculos.length === 0 ? (
            <Aviso tipo="alerta">No hay vehículos activos. Registra o reactiva un vehículo para generar rutas.</Aviso>
          ) : (
            <div className="opciones-tarjeta" role="group" aria-label="Vehículo">
              {vehiculos.map((v) => (
                <button key={v.id} type="button" className="opcion-tarjeta" aria-pressed={vehiculoId === v.id} onClick={() => elegirVehiculo(v)}>
                  <strong className="num">
                    <IconoVehiculo tipo={v.tipo} /> {v.placa}
                  </strong>
                  <span>
                    {ETIQUETAS_TIPO_VEHICULO[v.tipo]} · {formatearKg(v.capacidad_carga_kg)}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="campos">
            <CampoGrupo etiqueta="Fecha" requerido htmlFor="fecha">
              <input id="fecha" className="campo" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </CampoGrupo>
            <CampoGrupo
              etiqueta={salidaFija ? 'Hora de salida' : 'Disponible desde'}
              requerido
              htmlFor="salida"
              ayuda={salidaFija ? 'El vehículo saldrá exactamente a esta hora.' : 'Hora más temprana a la que puede salir; se calculará la salida óptima.'}
            >
              <input id="salida" className="campo" type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} required />
            </CampoGrupo>
            <label className="campo-grupo" style={{ alignContent: 'center' }}>
              <span className="acciones">
                <input type="checkbox" checked={salidaFija} onChange={(e) => setSalidaFija(e.target.checked)} />
                <span className="campo-etiqueta">Salir exactamente a esta hora</span>
              </span>
              <span className="ayuda">Úsalo si el turno del conductor fija la salida.</span>
            </label>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            2. Pedidos a entregar
            <small>El sistema calculará el mejor orden respetando las ventanas de entrega.</small>
          </legend>

          {opciones.length === 0 ? (
            <Aviso tipo="info">No hay pedidos disponibles para esta ruta. Los pedidos entregados, cancelados o ya incluidos en otra ruta activa no aparecen.</Aviso>
          ) : (
            <>
              <div className="barra-filtros" style={{ padding: 0, border: 0 }}>
                <div className="buscador">
                  <Search size={16} aria-hidden />
                  <input className="campo" type="search" placeholder="Filtrar pedidos…" aria-label="Filtrar pedidos" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <button type="button" className="boton boton-secundario boton-sm" onClick={alternarTodos} disabled={visibles.length === 0}>
                  {todosVisibles ? 'Quitar todos' : 'Seleccionar todos'}
                </button>
              </div>
              <div className="tabla-envoltorio tarjeta">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>
                        <span className="sr-only">Incluir</span>
                      </th>
                      <th>Cliente</th>
                      <th>Carga</th>
                      <th>Ventana</th>
                      <th>Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((p) => (
                      <tr key={p.id} className={noCaben[p.id] ? 'fila-bloqueada' : 'fila-clic'} onClick={() => alternar(p.id)}>
                        <td>
                          <input
                            type="checkbox"
                            disabled={Boolean(noCaben[p.id])}
                            checked={seleccion.has(p.id)}
                            onChange={() => alternar(p.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Incluir pedido de ${p.cliente_nombre}`}
                          />
                        </td>
                        <td>
                          <div className="texto-principal">{p.cliente_nombre}</div>
                          <div className="texto-secundario">
                            {p.direccion}
                            {asignacionPorPedido[p.id] === vehiculoId && vehiculoId && ' · asignado a este vehículo'}
                          </div>
                          {noCaben[p.id] && (
                            <div className="error-campo">
                              No cabe en {vehiculo.placa}: {noCaben[p.id].map((b) => `${b.descripcion} (${medidasBulto(b)})`).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="num">
                          {formatearKg(p.peso_kg)}
                          <div className="texto-secundario">{Number(p.volumen_m3.toFixed(3)).toLocaleString('es-PE')} m³</div>
                        </td>
                        <td className="num">{formatearVentana(p)}</td>
                        <td>
                          <BadgePrioridad prioridad={p.prioridad} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </fieldset>
      </div>

      <div className="barra-acciones" style={{ alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px' }}>
          {vehiculo ? (
            <div className="pila" style={{ gap: 8 }}>
              <MedidorCapacidad usado={peso} capacidad={vehiculo.capacidad_carga_kg} />
              <MedidorCapacidad usado={volumen} capacidad={volumenMax} etiqueta="Volumen" unidad="m³" decimales={3} />
            </div>
          ) : (
            <span className="ayuda">{seleccionados.length} pedido(s) seleccionado(s)</span>
          )}
        </div>
        <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={generando}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={generando || Boolean(motivoBloqueo)} title={motivoBloqueo ?? undefined}>
          {generando ? <Cargando texto="Optimizando ruta" /> : `Generar ruta (${seleccionados.length})`}
        </button>
      </div>
    </form>
  )
}
