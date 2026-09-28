import { BadgeEstado, BadgePrioridad } from './Badges.jsx'
import { ETIQUETAS_ESTADO, ETIQUETAS_PRIORIDAD, formatearVentana } from '../utils/formatos.js'

const OPCIONES_ESTADO = Object.entries(ETIQUETAS_ESTADO).map(([valor, etiqueta]) => ({
  valor,
  etiqueta,
}))
const OPCIONES_PRIORIDAD = Object.entries(ETIQUETAS_PRIORIDAD).map(([valor, etiqueta]) => ({
  valor,
  etiqueta,
}))

export function PedidoLista({
  pedidos,
  filtros,
  onCambiarFiltros,
  onCrear,
  onVer,
  onEditar,
  onCambiarEstado,
  onCancelar,
  cargando,
}) {
  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Listado de pedidos</h2>
        <button className="boton boton-primario" type="button" onClick={onCrear}>
          + Nuevo pedido
        </button>
      </div>

      <div className="filtros">
        <input
          className="campo"
          type="search"
          placeholder="Buscar por cliente, dirección o referencia…"
          value={filtros.busqueda}
          onChange={(e) => onCambiarFiltros({ ...filtros, busqueda: e.target.value })}
        />
        <select
          className="campo"
          aria-label="Filtrar por prioridad"
          value={filtros.prioridad}
          onChange={(e) => onCambiarFiltros({ ...filtros, prioridad: e.target.value })}
        >
          <option value="">Todas las prioridades</option>
          {OPCIONES_PRIORIDAD.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
        <select
          className="campo"
          aria-label="Filtrar por estado"
          value={filtros.estado}
          onChange={(e) => onCambiarFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          {OPCIONES_ESTADO.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Prioridad</th>
              <th>Ventana</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="6" className="celda-centrada">
                  Cargando pedidos…
                </td>
              </tr>
            )}
            {!cargando && pedidos.length === 0 && (
              <tr>
                <td colSpan="6" className="celda-centrada">
                  No hay pedidos registrados.
                </td>
              </tr>
            )}
            {!cargando &&
              pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>
                    <div className="texto-principal">{pedido.cliente_nombre}</div>
                    <div className="texto-secundario">{pedido.cliente_id}</div>
                  </td>
                  <td>
                    <div className="texto-principal">{pedido.direccion}</div>
                    <div className="texto-secundario">
                      {pedido.punto_referencia || '—'}
                    </div>
                  </td>
                  <td>
                    <BadgePrioridad prioridad={pedido.prioridad} />
                  </td>
                  <td>{formatearVentana(pedido)}</td>
                  <td>
                    <BadgeEstado estado={pedido.estado} />
                  </td>
                  <td>
                    <div className="acciones">
                      <button
                        className="boton boton-secundario"
                        type="button"
                        onClick={() => onVer(pedido)}
                      >
                        Ver
                      </button>
                      <button
                        className="boton boton-secundario"
                        type="button"
                        disabled={pedido.estado === 'entregado' || pedido.estado === 'cancelado'}
                        onClick={() => onEditar(pedido)}
                      >
                        Editar
                      </button>
                      <select
                        className="campo campo-select-pequeno"
                        aria-label="Cambiar estado"
                        value={pedido.estado}
                        disabled={pedido.estado === 'entregado' || pedido.estado === 'cancelado'}
                        onChange={(e) => onCambiarEstado(pedido, e.target.value)}
                      >
                        {OPCIONES_ESTADO.map((o) => (
                          <option key={o.valor} value={o.valor}>
                            → {o.etiqueta}
                          </option>
                        ))}
                      </select>
                      <button
                        className="boton boton-peligro"
                        type="button"
                        disabled={pedido.estado === 'entregado' || pedido.estado === 'cancelado'}
                        onClick={() => onCancelar(pedido)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}