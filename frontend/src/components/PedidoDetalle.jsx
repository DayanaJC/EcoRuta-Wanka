import { useState } from 'react'
import { BadgeEstado, BadgePrioridad } from './Badges.jsx'
import { ETIQUETAS_ESTADO, formatearFecha, formatearVentana } from '../utils/formatos.js'

const OPCIONES_ESTADO = Object.entries(ETIQUETAS_ESTADO).map(([valor, etiqueta]) => ({
  valor,
  etiqueta,
}))

export function PedidoDetalle({
  pedido,
  onCambiarEstado,
  onCancelar,
  onEditar,
  onVolver,
  gestionando,
}) {
  const esTerminal = pedido.estado === 'entregado' || pedido.estado === 'cancelado'
  const [estadoNuevo, setEstadoNuevo] = useState(pedido.estado)

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Detalle del pedido</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver al listado
        </button>
      </div>

      <div className="detalle-mallas">
        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Cliente</h3>
            <p className="detalle-fuerte">{pedido.cliente_nombre}</p>
            <p className="detalle-suave">ID: {pedido.cliente_id}</p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Prioridad y tipo</h3>
            <p>
              <BadgePrioridad prioridad={pedido.prioridad} />
            </p>
            <p className="detalle-suave">{pedido.tipo_producto === 'perecedero' ? 'Perecedero' : 'No perecedero'}</p>
          </div>
        </div>

        <div className="tarjeta-detalle">
          <h3>Entrega</h3>
          <p className="detalle-fuerte">{pedido.direccion}</p>
          <p className="detalle-suave">
            Referencia: {pedido.punto_referencia || '—'}
          </p>
        </div>

        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Carga</h3>
            <p>
              <span className="detalle-fuerte">{pedido.peso_kg} kg</span> ·{' '}
              <span className="detalle-suave">{pedido.volumen_m3} m³</span>
            </p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Coordenadas GPS</h3>
            <p className="detalle-suave">
              {pedido.latitud}, {pedido.longitud}
            </p>
          </div>
        </div>

        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Ventana de entrega</h3>
            <p className="detalle-fuerte">{formatearVentana(pedido)}</p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Estado</h3>
            <p>
              <BadgeEstado estado={pedido.estado} />
            </p>
            <p className="detalle-suave">
              Creado: {formatearFecha(pedido.created_at)} · Actualizado:{' '}
              {formatearFecha(pedido.updated_at)}
            </p>
          </div>
        </div>

        {esTerminal ? (
          <p className="aviso">Este pedido está {pedido.estado === 'cancelado' ? 'cancelado' : 'entregado'} y ya no admite cambios.</p>
        ) : (
          <div className="acciones-detalle">
            <label className="campo-etiqueta">
              Cambiar estado
              <select
                className="campo"
                value={estadoNuevo}
                onChange={(e) => setEstadoNuevo(e.target.value)}
              >
                {OPCIONES_ESTADO.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="boton boton-primario"
              type="button"
              disabled={gestionando || estadoNuevo === pedido.estado}
              onClick={() => onCambiarEstado(pedido, estadoNuevo)}
            >
              Aplicar estado
            </button>
            <button className="boton boton-secundario" type="button" onClick={() => onEditar(pedido)} disabled={gestionando}>
              Editar pedido
            </button>
            <button
              className="boton boton-peligro"
              type="button"
              disabled={gestionando}
              onClick={() => onCancelar(pedido)}
            >
              Cancelar pedido
            </button>
          </div>
        )}
      </div>
    </section>
  )
}