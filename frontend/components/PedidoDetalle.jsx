import { XCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { BadgeEstado, BadgePrioridad } from './Badges.jsx'
import { Aviso } from './ui.jsx'
import { medidasBulto, volumenBultoM3 } from '../utils/carga.js'
import {
  ESTADOS_TERMINALES_PEDIDO,
  ETIQUETAS_TIPO,
  formatearFecha,
  formatearKg,
  formatearNumero,
  formatearVentana,
} from '../utils/formatos.js'

const MapaSelector = dynamic(() => import('./MapaSelector.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-selector mapa-cargando">Cargando mapa…</div>,
})

// Los estados "en ruta" y "entregado" no se marcan aquí: los registra la ruta
// (al iniciar el reparto y al registrar cada parada).
export function PedidoDetalle({ pedido, onCancelar, gestionando }) {
  const terminal = ESTADOS_TERMINALES_PEDIDO.includes(pedido.estado)

  return (
    <div className="pila">
      {terminal && (
        <Aviso tipo="info">Este pedido está {pedido.estado === 'cancelado' ? 'cancelado' : 'entregado'} y ya no admite cambios.</Aviso>
      )}
      {pedido.estado === 'en_ruta' && (
        <Aviso tipo="info">El pedido está en reparto. Su entrega se registra desde la ruta.</Aviso>
      )}

      <div className="rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Datos del pedido</h2>
            <div className="acciones">
              <BadgePrioridad prioridad={pedido.prioridad} />
              <BadgeEstado estado={pedido.estado} />
            </div>
          </div>
          <div className="tarjeta-cuerpo">
            <dl className="datos">
              <div>
                <dt>Cliente</dt>
                <dd>
                  {pedido.cliente_nombre}
                  <div className="texto-secundario">{pedido.cliente_id}</div>
                </dd>
              </div>
              <div>
                <dt>Ventana de entrega</dt>
                <dd className="num">{formatearVentana(pedido)}</dd>
              </div>
              <div>
                <dt>Carga</dt>
                <dd className="num">
                  {formatearKg(pedido.peso_kg)} · {formatearNumero(pedido.volumen_m3)} m³
                </dd>
              </div>
              <div>
                <dt>Producto</dt>
                <dd>{ETIQUETAS_TIPO[pedido.tipo_producto]}</dd>
              </div>
              <div>
                <dt>Tiempo de entrega</dt>
                <dd>{pedido.tiempo_servicio_min ?? 5} min</dd>
              </div>
              <div>
                <dt>Registrado</dt>
                <dd>{formatearFecha(pedido.created_at)}</dd>
              </div>
              {pedido.fecha_entrega && (
                <div>
                  <dt>Entregado</dt>
                  <dd>{formatearFecha(pedido.fecha_entrega)}</dd>
                </div>
              )}
              <div>
                <dt>Actualizado</dt>
                <dd>{formatearFecha(pedido.updated_at)}</dd>
              </div>
            </dl>
          </div>
          {pedido.estado === 'pendiente' && (
            <div className="barra-acciones">
              <button type="button" className="boton boton-peligro" onClick={() => onCancelar(pedido)} disabled={gestionando}>
                <XCircle size={16} aria-hidden /> Cancelar pedido
              </button>
            </div>
          )}
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Ubicación de entrega</h2>
          </div>
          <div className="tarjeta-cuerpo pila">
            <div>
              <div className="texto-principal">{pedido.direccion}</div>
              <div className="texto-secundario">{pedido.punto_referencia || 'Sin punto de referencia'}</div>
            </div>
            <MapaSelector posicion={[pedido.latitud, pedido.longitud]} soloLectura />
            <span className="ayuda num">
              {pedido.latitud}, {pedido.longitud}
            </span>
          </div>
        </section>
      </div>

      <section className="tarjeta">
        <div className="tarjeta-titulo">
          <h2>Bultos</h2>
          <span className="texto-secundario num">
            {formatearKg(pedido.peso_kg)} · {formatearNumero(pedido.volumen_m3)} m³
          </span>
        </div>
        <div className="tabla-envoltorio">
          <table className="tabla tabla-responsiva">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Medidas</th>
                <th>Peso c/u</th>
                <th>Volumen</th>
                <th>Apilable</th>
              </tr>
            </thead>
            <tbody>
              {(pedido.bultos ?? []).map((b) => (
                <tr key={b.id}>
                  <td data-etiqueta="Descripción" className="texto-principal">
                    {b.descripcion}
                  </td>
                  <td data-etiqueta="Cantidad" className="num">
                    {b.cantidad}
                  </td>
                  <td data-etiqueta="Medidas" className="num">
                    {medidasBulto(b)}
                  </td>
                  <td data-etiqueta="Peso c/u" className="num">
                    {formatearKg(b.peso_kg)}
                  </td>
                  <td data-etiqueta="Volumen" className="num">
                    {formatearNumero(Number((volumenBultoM3(b) * b.cantidad).toFixed(3)))} m³
                  </td>
                  <td data-etiqueta="Apilable">{b.apilable ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
