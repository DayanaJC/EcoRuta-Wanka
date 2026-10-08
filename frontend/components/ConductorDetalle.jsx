import { Phone, Power, PowerOff } from 'lucide-react'
import { BadgeEstadoConductor, BadgeEstadoRuta } from './Badges.jsx'
import { navegar } from './navegacion.js'
import { Aviso, EstadoVacio } from './ui.jsx'
import { formatearDuracion, formatearFecha, formatearFechaCorta, formatearKm, sumarMinutos } from '../utils/formatos.js'

export function ConductorDetalle({ conductor, rutas, vehiculosPorId, onCambiarEstado, gestionando }) {
  const activo = conductor.estado === 'activo'
  const ordenadas = [...rutas].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora_salida.localeCompare(a.hora_salida))
  const pendientes = rutas.filter((r) => r.estado === 'generada' || r.estado === 'en_reparto').length

  return (
    <div className="pila">
      {!activo && <Aviso tipo="alerta">Este conductor está inactivo: no se le pueden asignar rutas.</Aviso>}

      <div className="rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Datos del conductor</h2>
            <BadgeEstadoConductor estado={conductor.estado} />
          </div>
          <div className="tarjeta-cuerpo">
            <dl className="datos">
              <div>
                <dt>DNI</dt>
                <dd className="num">{conductor.dni}</dd>
              </div>
              <div>
                <dt>Licencia</dt>
                <dd className="num">{conductor.licencia ?? '—'}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd className="num">
                  {conductor.telefono ? (
                    <a className="acciones" href={`tel:${conductor.telefono}`}>
                      <Phone size={14} aria-hidden /> {conductor.telefono}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Rutas por hacer</dt>
                <dd className="num">{pendientes}</dd>
              </div>
              <div>
                <dt>Registrado</dt>
                <dd>{formatearFecha(conductor.created_at)}</dd>
              </div>
            </dl>
          </div>
          <div className="barra-acciones">
            {activo ? (
              <button
                type="button"
                className="boton boton-peligro"
                onClick={() => onCambiarEstado('inactivo')}
                disabled={gestionando}
                title={pendientes ? 'Primero asigna otro conductor a sus rutas por hacer' : undefined}
              >
                <PowerOff size={16} aria-hidden /> Desactivar conductor
              </button>
            ) : (
              <button type="button" className="boton boton-primario" onClick={() => onCambiarEstado('activo')} disabled={gestionando}>
                <Power size={16} aria-hidden /> Reactivar conductor
              </button>
            )}
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Rutas asignadas</h2>
          </div>
          {ordenadas.length === 0 ? (
            <EstadoVacio titulo="Sin rutas" descripcion="Asígnale una ruta desde el detalle de la ruta o al generarla." />
          ) : (
            <table className="tabla">
              <tbody>
                {ordenadas.slice(0, 8).map((r) => (
                  <tr key={r.id} className="fila-clic" onClick={() => navegar({ vista: 'rutas', accion: 'ver', id: r.id })}>
                    <td>
                      <div className="texto-principal">{formatearFechaCorta(r.fecha)}</div>
                      <div className="texto-secundario num">
                        {r.hora_salida} a {sumarMinutos(r.hora_salida, r.tiempo_estimado_min)} · {vehiculosPorId[r.vehiculo_id]?.placa ?? '—'} ·{' '}
                        {r.pedido_ids.length} paradas · {formatearKm(r.distancia_estimada_km)} · {formatearDuracion(r.tiempo_estimado_min)}
                      </div>
                    </td>
                    <td className="col-acciones">
                      <BadgeEstadoRuta estado={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
