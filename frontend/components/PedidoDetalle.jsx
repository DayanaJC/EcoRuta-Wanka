import { CheckCircle2, Truck, XCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { BadgeEstado, BadgePrioridad } from './Badges.jsx'
import { Aviso } from './ui.jsx'
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

// Acción siguiente según el estado del pedido (flujo natural del reparto)
const SIGUIENTE = {
  pendiente: { estado: 'en_ruta', texto: 'Marcar en ruta', icono: Truck },
  en_ruta: { estado: 'entregado', texto: 'Marcar entregado', icono: CheckCircle2 },
}

export function PedidoDetalle({ pedido, onCambiarEstado, onCancelar, gestionando }) {
  const terminal = ESTADOS_TERMINALES_PEDIDO.includes(pedido.estado)
  const siguiente = SIGUIENTE[pedido.estado]

  return (
    <div className="pila">
      {terminal && (
        <Aviso tipo="info">Este pedido está {pedido.estado === 'cancelado' ? 'cancelado' : 'entregado'} y ya no admite cambios.</Aviso>
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
              <div>
                <dt>Actualizado</dt>
                <dd>{formatearFecha(pedido.updated_at)}</dd>
              </div>
            </dl>
          </div>
          {!terminal && (
            <div className="barra-acciones">
              <button type="button" className="boton boton-peligro" onClick={() => onCancelar(pedido)} disabled={gestionando}>
                <XCircle size={16} aria-hidden /> Cancelar pedido
              </button>
              {siguiente && (
                <button
                  type="button"
                  className="boton boton-primario"
                  onClick={() => onCambiarEstado(pedido, siguiente.estado)}
                  disabled={gestionando}
                >
                  <siguiente.icono size={16} aria-hidden /> {siguiente.texto}
                </button>
              )}
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
    </div>
  )
}
