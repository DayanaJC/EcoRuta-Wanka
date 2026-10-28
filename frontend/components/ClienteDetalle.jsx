import { Phone, Power, PowerOff } from 'lucide-react'
import dynamic from 'next/dynamic'
import { BadgeEstado, BadgeEstadoCliente } from './Badges.jsx'
import { navegar } from './navegacion.js'
import { Aviso, EstadoVacio } from './ui.jsx'
import { ETIQUETAS_TIPO_CLIENTE, formatearDias, formatearFecha, formatearKg, formatearVentana } from '../utils/formatos.js'

const MapaSelector = dynamic(() => import('./MapaSelector.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-selector mapa-cargando">Cargando mapa…</div>,
})

export function ClienteDetalle({ cliente, pedidos, onCambiarEstado, gestionando }) {
  const activo = cliente.estado === 'activo'
  const ordenados = [...pedidos].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  // Pedidos por entregar cuya ventana no coincide con la preferencia actual
  const sinCruce = pedidos.filter(
    (p) => (p.estado === 'pendiente' || p.estado === 'en_ruta') && (p.ventana_entrega_fin <= cliente.ventana_inicio || p.ventana_entrega_inicio >= cliente.ventana_fin),
  )

  return (
    <div className="pila">
      {!activo && <Aviso tipo="alerta">Este cliente está inactivo: sus preferencias no se aplican al planificar rutas.</Aviso>}
      {activo && sinCruce.length > 0 && (
        <Aviso tipo="alerta">
          {sinCruce.length} pedido(s) por entregar tienen una ventana fuera del horario preferido ({cliente.ventana_inicio} – {cliente.ventana_fin}). No se podrán
          incluir en una ruta hasta corregir la ventana del pedido o la preferencia.
        </Aviso>
      )}

      <div className="rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Preferencias de entrega</h2>
            <BadgeEstadoCliente estado={cliente.estado} />
          </div>
          <div className="tarjeta-cuerpo">
            <dl className="datos">
              <div>
                <dt>Días de recepción</dt>
                <dd>{formatearDias(cliente.dias_recepcion)}</dd>
              </div>
              <div>
                <dt>Horario preferido</dt>
                <dd className="num">
                  {cliente.ventana_inicio} – {cliente.ventana_fin}
                </dd>
              </div>
              <div>
                <dt>Tiempo de atención</dt>
                <dd className="num">{cliente.tiempo_atencion_min} min</dd>
              </div>
              <div>
                <dt>Tipo de negocio</dt>
                <dd>{ETIQUETAS_TIPO_CLIENTE[cliente.tipo] ?? cliente.tipo}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd className="num">
                  {cliente.telefono ? (
                    <a className="acciones" href={`tel:${cliente.telefono}`}>
                      <Phone size={14} aria-hidden /> {cliente.telefono}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Actualizado</dt>
                <dd>{formatearFecha(cliente.updated_at)}</dd>
              </div>
            </dl>
            {cliente.indicaciones && (
              <div style={{ marginTop: 18 }}>
                <Aviso tipo="info">
                  <strong>Indicaciones para el conductor:</strong> {cliente.indicaciones}
                </Aviso>
              </div>
            )}
            <div className="acciones" style={{ marginTop: 18 }}>
              {activo ? (
                <button type="button" className="boton boton-secundario boton-sm" onClick={() => onCambiarEstado('inactivo')} disabled={gestionando}>
                  <PowerOff size={15} aria-hidden /> Desactivar
                </button>
              ) : (
                <button type="button" className="boton boton-primario boton-sm" onClick={() => onCambiarEstado('activo')} disabled={gestionando}>
                  <Power size={15} aria-hidden /> Reactivar
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Ubicación</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <p style={{ marginTop: 0 }}>
              {cliente.direccion}
              {cliente.punto_referencia && <span className="texto-secundario"> · {cliente.punto_referencia}</span>}
            </p>
            <MapaSelector posicion={[cliente.latitud, cliente.longitud]} soloLectura />
          </div>
        </section>
      </div>

      <section className="tarjeta">
        <div className="tarjeta-titulo">
          <h2>Pedidos del cliente</h2>
          <span className="texto-secundario">{pedidos.length}</span>
        </div>
        {ordenados.length === 0 ? (
          <EstadoVacio titulo="Sin pedidos" descripcion={`Los pedidos con el código ${cliente.codigo} aparecerán aquí.`} />
        ) : (
          <div className="tabla-envoltorio">
            <table className="tabla tabla-responsiva">
              <thead>
                <tr>
                  <th>Registrado</th>
                  <th>Ventana</th>
                  <th>Carga</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((p) => (
                  <tr key={p.id} className="fila-clic" onClick={() => navegar({ vista: 'pedidos', accion: 'ver', id: p.id })}>
                    <td data-etiqueta="Registrado">{formatearFecha(p.created_at)}</td>
                    <td data-etiqueta="Ventana" className="num">
                      {formatearVentana(p)}
                    </td>
                    <td data-etiqueta="Carga" className="num">
                      {formatearKg(p.peso_kg)}
                    </td>
                    <td data-etiqueta="Estado">
                      <BadgeEstado estado={p.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
