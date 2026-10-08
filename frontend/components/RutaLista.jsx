import { Route } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstadoRuta } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'
import { ETIQUETAS_ESTADO_RUTA, formatearDuracion, formatearFechaCorta, formatearKm } from '../utils/formatos.js'

const SEGMENTOS = [['', 'Todas'], ...Object.entries(ETIQUETAS_ESTADO_RUTA)]

export function RutaLista({ rutas, vehiculosPorId, conductoresPorId = {}, cargando, onVer, onNueva }) {
  const [estado, setEstado] = useState('')
  const filtradas = rutas.filter((r) => !estado || r.estado === estado)

  if (!cargando && rutas.length === 0) {
    return (
      <section className="tarjeta">
        <EstadoVacio icono={Route} titulo="Aún no hay rutas" descripcion="Genera una ruta optimizada a partir de los pedidos pendientes y un vehículo activo.">
          <button type="button" className="boton boton-primario" onClick={onNueva}>
            Generar ruta
          </button>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section className="tarjeta">
      <div className="barra-filtros">
        <div className="segmentos" role="group" aria-label="Filtrar por estado">
          {SEGMENTOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>
      {!cargando && filtradas.length === 0 ? (
        <EstadoVacio titulo="Sin rutas en este estado" />
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla tabla-responsiva">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Paradas</th>
                <th>Distancia</th>
                <th>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <FilasCargando columnas={7} filas={3} />
              ) : (
                filtradas.map((r) => {
                  const v = vehiculosPorId[r.vehiculo_id]
                  return (
                    <tr key={r.id} className="fila-clic" onClick={() => onVer(r)}>
                      <td data-etiqueta="Fecha">
                        <div>
                          <div className="texto-principal">{formatearFechaCorta(r.fecha)}</div>
                          <div className="texto-secundario num">Salida {r.hora_salida}</div>
                        </div>
                      </td>
                      <td data-etiqueta="Vehículo">
                        {v ? (
                          <span className="acciones">
                            <IconoVehiculo tipo={v.tipo} /> <span className="texto-principal num">{v.placa}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td data-etiqueta="Conductor">
                        {conductoresPorId[r.conductor_id]?.nombre ?? <span className="texto-secundario">Sin asignar</span>}
                      </td>
                      <td data-etiqueta="Paradas" className="num">
                        {r.pedido_ids.length}
                      </td>
                      <td data-etiqueta="Distancia" className="num">
                        {formatearKm(r.distancia_estimada_km)}
                      </td>
                      <td data-etiqueta="Duración" className="num">
                        {formatearDuracion(r.tiempo_estimado_min)}
                      </td>
                      <td data-etiqueta="Estado">
                        <BadgeEstadoRuta estado={r.estado} />
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
