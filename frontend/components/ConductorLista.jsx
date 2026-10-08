import { IdCard, Pencil, Search } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstadoConductor } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import { formatearFechaCorta, normalizar } from '../utils/formatos.js'

const SEGMENTOS = [
  ['', 'Todos'],
  ['activo', 'Activos'],
  ['inactivo', 'Inactivos'],
]

// Próxima ruta por hacer (generada o en reparto) de cada conductor; incluye las de días
// anteriores que nunca se iniciaron, porque siguen ocupándolo
export function proximaRuta(conductorId, rutas) {
  return rutas
    .filter((r) => r.conductor_id === conductorId && (r.estado === 'generada' || r.estado === 'en_reparto'))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_salida.localeCompare(b.hora_salida))[0]
}

export function ConductorLista({ conductores, rutas, vehiculosPorId, cargando, onNuevo, onVer, onEditar }) {
  const [estado, setEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const texto = normalizar(busqueda.trim())
  const filtrados = conductores
    .filter((c) => !estado || c.estado === estado)
    .filter((c) => !texto || normalizar(`${c.nombre} ${c.dni} ${c.licencia ?? ''}`).includes(texto))

  if (!cargando && conductores.length === 0) {
    return (
      <section className="tarjeta">
        <EstadoVacio icono={IdCard} titulo="Aún no hay conductores" descripcion="Registra a los conductores para asignarles las rutas de reparto.">
          <button type="button" className="boton boton-primario" onClick={onNuevo}>
            Registrar conductor
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
            placeholder="Buscar por nombre, DNI o licencia"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar conductor"
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
        <EstadoVacio titulo="Sin resultados" descripcion="Ningún conductor coincide con la búsqueda." />
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla tabla-responsiva">
            <thead>
              <tr>
                <th>Conductor</th>
                <th>Licencia</th>
                <th>Teléfono</th>
                <th>Ruta por hacer</th>
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
                filtrados.map((c) => {
                  const proxima = proximaRuta(c.id, rutas)
                  return (
                    <tr key={c.id} className="fila-clic" onClick={() => onVer(c)}>
                      <td data-etiqueta="Conductor">
                        <div>
                          <div className="texto-principal">{c.nombre}</div>
                          <div className="texto-secundario num">DNI {c.dni}</div>
                        </div>
                      </td>
                      <td data-etiqueta="Licencia" className="num">
                        {c.licencia ?? '—'}
                      </td>
                      <td data-etiqueta="Teléfono" className="num">
                        {c.telefono ?? '—'}
                      </td>
                      <td data-etiqueta="Ruta por hacer">
                        {proxima ? (
                          <div>
                            <div>{formatearFechaCorta(proxima.fecha)}</div>
                            <div className="texto-secundario num">
                              {proxima.hora_salida} · {vehiculosPorId[proxima.vehiculo_id]?.placa ?? '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="texto-secundario">Sin rutas pendientes</span>
                        )}
                      </td>
                      <td data-etiqueta="Estado">
                        <BadgeEstadoConductor estado={c.estado} />
                      </td>
                      <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="boton boton-fantasma boton-icono"
                          onClick={() => onEditar(c)}
                          aria-label={`Editar conductor ${c.nombre}`}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
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
