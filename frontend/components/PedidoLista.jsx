import { ChevronLeft, ChevronRight, Package, Pencil, Search, XCircle } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstado, BadgePrioridad } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import {
  ESTADOS_TERMINALES_PEDIDO,
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
  formatearKg,
  formatearNumero,
  formatearVentana,
  normalizar,
} from '../utils/formatos.js'

const SEGMENTOS = [['', 'Todos'], ...Object.entries(ETIQUETAS_ESTADO)]
// Paginación (Green IT): la tabla dibuja 12 filas a la vez
const POR_PAGINA = 12

export function PedidoLista({ pedidos, cargando, onNuevo, onVer, onEditar, onCancelar }) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [prioridad, setPrioridad] = useState('')
  const [paginaElegida, setPagina] = useState(1)

  const texto = normalizar(busqueda.trim())
  const filtrados = pedidos.filter(
    (p) =>
      (!estado || p.estado === estado) &&
      (!prioridad || p.prioridad === prioridad) &&
      (!texto || normalizar([p.cliente_nombre, p.cliente_id, p.direccion, p.punto_referencia].join(' ')).includes(texto)),
  )
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const pagina = Math.min(paginaElegida, paginas)
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const hayFiltros = busqueda || estado || prioridad
  // Al cambiar un filtro se vuelve a la primera página
  const filtrar = (cambiar) => (valor) => {
    cambiar(valor)
    setPagina(1)
  }
  const limpiar = () => {
    setBusqueda('')
    setEstado('')
    setPrioridad('')
    setPagina(1)
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
            onChange={(e) => filtrar(setBusqueda)(e.target.value)}
          />
        </div>
        <div className="segmentos" role="group" aria-label="Filtrar por estado">
          {SEGMENTOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={estado === valor} onClick={() => filtrar(setEstado)(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
        <select className="campo" style={{ width: 'auto' }} aria-label="Filtrar por prioridad" value={prioridad} onChange={(e) => filtrar(setPrioridad)(e.target.value)}>
          <option value="">Toda prioridad</option>
          {Object.entries(ETIQUETAS_PRIORIDAD).map(([v, e]) => (
            <option key={v} value={v}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* El contenedor existe también mientras carga: reserva su alto y evita el salto (CLS) */}
      <div className="resultado-filtros">
        {!cargando && pedidos.length > 0 && (
          <>
            {filtrados.length} de {pedidos.length} pedidos
            {hayFiltros && (
              <>
                {' · '}
                <button type="button" className="boton boton-fantasma boton-sm" onClick={limpiar}>
                  Limpiar filtros
                </button>
              </>
            )}
          </>
        )}
      </div>

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
                <th>Carga</th>
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
                <FilasCargando columnas={7} filas={POR_PAGINA} />
              ) : (
                visibles.map((p) => {
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
                      <td data-etiqueta="Carga" className="num">
                        <div>
                          {formatearKg(p.peso_kg)}
                          <div className="texto-secundario">
                            {formatearNumero(p.volumen_m3)} m³ · {(p.bultos ?? []).reduce((s, b) => s + b.cantidad, 0)} bulto(s)
                          </div>
                        </div>
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
                            disabled={terminal || p.estado === 'en_ruta'}
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
          {!cargando && paginas > 1 && (
            <nav className="paginacion" aria-label="Páginas de pedidos">
              <button type="button" className="boton boton-secundario boton-sm" onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>
                <ChevronLeft size={16} aria-hidden /> Anterior
              </button>
              <span aria-live="polite">
                Página {pagina} de {paginas}
              </span>
              <button type="button" className="boton boton-secundario boton-sm" onClick={() => setPagina(pagina + 1)} disabled={pagina === paginas}>
                Siguiente <ChevronRight size={16} aria-hidden />
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  )
}
