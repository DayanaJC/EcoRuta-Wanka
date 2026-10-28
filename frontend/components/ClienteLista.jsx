import { Pencil, Search, Store } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstadoCliente } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import { ETIQUETAS_TIPO_CLIENTE, formatearDias, normalizar } from '../utils/formatos.js'

const SEGMENTOS = [
  ['', 'Todos'],
  ['activo', 'Activos'],
  ['inactivo', 'Inactivos'],
]

export function ClienteLista({ clientes, pedidos, cargando, onNuevo, onVer, onEditar }) {
  const [estado, setEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const texto = normalizar(busqueda.trim())
  const filtrados = clientes
    .filter((c) => !estado || c.estado === estado)
    .filter((c) => !texto || normalizar(`${c.codigo} ${c.nombre} ${c.direccion}`).includes(texto))
  const pendientesPorCodigo = pedidos.reduce((acc, p) => {
    if (p.estado === 'pendiente' || p.estado === 'en_ruta') acc[p.cliente_id] = (acc[p.cliente_id] ?? 0) + 1
    return acc
  }, {})

  if (!cargando && clientes.length === 0) {
    return (
      <section className="tarjeta">
        <EstadoVacio
          icono={Store}
          titulo="Aún no hay clientes registrados"
          descripcion="Registra a las bodegas y comercios con sus días y horario de recepción para que las rutas los respeten."
        >
          <button type="button" className="boton boton-primario" onClick={onNuevo}>
            Registrar cliente
          </button>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section className="tarjeta">
      <div className="barra-filtros">
        <div className="buscador">
          <Search size={16} aria-hidden />
          <input
            className="campo"
            type="search"
            placeholder="Buscar por código, nombre o dirección"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar cliente"
          />
        </div>
        <div className="segmentos" role="group" aria-label="Filtrar por estado">
          {SEGMENTOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>
      {!cargando && filtrados.length === 0 ? (
        <EstadoVacio titulo="Sin resultados" descripcion="Ningún cliente coincide con la búsqueda." />
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla tabla-responsiva">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Recibe</th>
                <th>Horario</th>
                <th>Pedidos por entregar</th>
                <th>Estado</th>
                <th className="col-acciones">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <FilasCargando columnas={6} filas={3} />
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id} className="fila-clic" onClick={() => onVer(c)}>
                    <td data-etiqueta="Cliente">
                      <div>
                        <div className="texto-principal">{c.nombre}</div>
                        <div className="texto-secundario num">
                          {c.codigo} · {ETIQUETAS_TIPO_CLIENTE[c.tipo] ?? c.tipo}
                        </div>
                      </div>
                    </td>
                    <td data-etiqueta="Recibe">{formatearDias(c.dias_recepcion)}</td>
                    <td data-etiqueta="Horario" className="num">
                      {c.ventana_inicio} – {c.ventana_fin}
                    </td>
                    <td data-etiqueta="Pedidos por entregar" className="num">
                      {pendientesPorCodigo[c.codigo] ?? 0}
                    </td>
                    <td data-etiqueta="Estado">
                      <BadgeEstadoCliente estado={c.estado} />
                    </td>
                    <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="boton boton-fantasma boton-icono"
                        onClick={() => onEditar(c)}
                        aria-label={`Editar cliente ${c.nombre}`}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
