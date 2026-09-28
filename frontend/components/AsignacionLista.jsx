import { Link2, Unlink } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstadoAsignacion } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'
import { formatearFecha, formatearKg, formatearVentana } from '../utils/formatos.js'

const SEGMENTOS = [
  ['asignada', 'Activas'],
  ['cancelada', 'Canceladas'],
  ['', 'Todas'],
]

export function AsignacionLista({ asignaciones, pedidosPorId, vehiculosPorId, cargando, onNueva, onCancelar, gestionando }) {
  const [estado, setEstado] = useState('asignada')
  const filtradas = asignaciones.filter((a) => !estado || a.estado === estado)

  return (
    <section className="tarjeta">
      <div className="barra-filtros">
        <div className="segmentos" role="group" aria-label="Filtrar asignaciones">
          {SEGMENTOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {!cargando && filtradas.length === 0 ? (
        <EstadoVacio
          icono={Link2}
          titulo={estado === 'asignada' ? 'No hay asignaciones activas' : 'No hay asignaciones'}
          descripcion="Asigna pedidos pendientes a un vehículo activo con capacidad suficiente."
        >
          <button type="button" className="boton boton-primario" onClick={onNueva}>
            Nueva asignación
          </button>
        </EstadoVacio>
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla tabla-responsiva">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Vehículo</th>
                <th>Asignado</th>
                <th>Estado</th>
                <th className="col-acciones">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <FilasCargando columnas={5} filas={3} />
              ) : (
                filtradas.map((a) => {
                  const pedido = pedidosPorId[a.pedido_id]
                  const vehiculo = vehiculosPorId[a.vehiculo_id]
                  return (
                    <tr key={a.id}>
                      <td data-etiqueta="Pedido">
                        <div>
                          <div className="texto-principal">{pedido?.cliente_nombre ?? 'Pedido no encontrado'}</div>
                          {pedido && (
                            <div className="texto-secundario num">
                              {formatearKg(pedido.peso_kg)} · {formatearVentana(pedido)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td data-etiqueta="Vehículo">
                        {vehiculo ? (
                          <span className="acciones">
                            <IconoVehiculo tipo={vehiculo.tipo} />
                            <span className="texto-principal num">{vehiculo.placa}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td data-etiqueta="Asignado">{formatearFecha(a.fecha_asignacion)}</td>
                      <td data-etiqueta="Estado">
                        <BadgeEstadoAsignacion estado={a.estado} />
                      </td>
                      <td className="col-acciones">
                        {a.estado === 'asignada' && (
                          <button
                            type="button"
                            className="boton boton-fantasma boton-sm"
                            onClick={() => onCancelar(a, pedido)}
                            disabled={gestionando}
                          >
                            <Unlink size={15} aria-hidden /> Liberar
                          </button>
                        )}
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
