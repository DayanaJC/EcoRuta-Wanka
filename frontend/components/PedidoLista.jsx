import { Package, Pencil, Search, XCircle } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstado, BadgePrioridad } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import {
  ESTADOS_TERMINALES_PEDIDO,
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
  formatearKg,
  formatearVentana,
  normalizar,
} from '../utils/formatos.js'

const SEGMENTOS = [['', 'Todos'], ...Object.entries(ETIQUETAS_ESTADO)]

export function PedidoLista({ pedidos, cargando, onNuevo, onVer, onEditar, onCancelar }) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [prioridad, setPrioridad] = useState('')

  const texto = normalizar(busqueda.trim())
  const filtrados = pedidos.filter(
    (p) =>
      (!estado || p.estado === estado) &&
      (!prioridad || p.prioridad === prioridad) &&
      (!texto || normalizar([p.cliente_nombre, p.cliente_id, p.direccion, p.punto_referencia].join(' ')).includes(texto)),
  )
  const hayFiltros = busqueda || estado || prioridad
  const limpiar = () => {
    setBusqueda('')
    setEstado('')
    setPrioridad('')
  }

  return (
    <section className="tarjeta">
      <div className="barra-filtros">
        <div className="buscador">
          <Search size={16} aria-hidden />
          <input
            className="campo"
            type="search"
            placeholder="Buscar cliente, código o dirección…"
            aria-label="Buscar pedidos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="segmentos" role="group" aria-label="Filtrar por estado">
          {SEGMENTOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
        <select className="campo" style={{ width: 'auto' }} aria-label="Filtrar por prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option value="">Toda prioridad</option>
          {Object.entries(ETIQUETAS_PRIORIDAD).map(([v, e]) => (
            <option key={v} value={v}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {!cargando && pedidos.length > 0 && (
        <div className="resultado-filtros">
          {filtrados.length} de {pedidos.length} pedidos
          {hayFiltros && (
            <>
              {' · '}
              <button type="button" className="boton boton-fantasma boton-sm" onClick={limpiar}>
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      )}

      {!cargando && pedidos.length === 0 ? (
        <EstadoVacio icono={Package} titulo="Aún no hay pedidos" descripcion="Registra el primer pedido para poder planificar rutas de reparto.">
          <button type="button" className="boton boton-primario" onClick={onNuevo}>
            Registrar pedido
          </button>
        </EstadoVacio>
      ) : !cargando && filtrados.length === 0 ? (
        <EstadoVacio icono={Search} titulo="Sin resultados" descripcion="Ningún pedido coincide con los filtros.">
          <button type="button" className="boton boton-secundario" onClick={limpiar}>
            Limpiar filtros
          </button>
        </EstadoVacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla tabla-responsiva">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Peso</th>
                <th>Ventana</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th className="col-acciones">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <FilasCargando columnas={7} />
              ) : (
                filtrados.map((p) => {
                  const terminal = ESTADOS_TERMINALES_PEDIDO.includes(p.estado)
                  return (
                    <tr key={p.id} className="fila-clic" onClick={() => onVer(p)}>
                      <td data-etiqueta="Cliente">
                        <div>
                          <div className="texto-principal">{p.cliente_nombre}</div>
                          <div className="texto-secundario">{p.cliente_id}</div>
                        </div>
                      </td>
                      <td data-etiqueta="Dirección">
                        <div>
                          <div>{p.direccion}</div>
                          {p.punto_referencia && <div className="texto-secundario">{p.punto_referencia}</div>}
                        </div>
                      </td>
                      <td data-etiqueta="Peso" className="num">
                        {formatearKg(p.peso_kg)}
                      </td>
                      <td data-etiqueta="Ventana" className="num">
                        {formatearVentana(p)}
                      </td>
                      <td data-etiqueta="Prioridad">
                        <BadgePrioridad prioridad={p.prioridad} />
                      </td>
                      <td data-etiqueta="Estado">
                        <BadgeEstado estado={p.estado} />
                      </td>
                      <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                        <div className="acciones">
                          <button
                            type="button"
                            className="boton boton-fantasma boton-icono"
                            onClick={() => onEditar(p)}
                            disabled={terminal}
                            aria-label={`Editar pedido de ${p.cliente_nombre}`}
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="boton boton-fantasma boton-icono"
                            onClick={() => onCancelar(p)}
                            disabled={terminal}
                            aria-label={`Cancelar pedido de ${p.cliente_nombre}`}
                            title="Cancelar pedido"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
