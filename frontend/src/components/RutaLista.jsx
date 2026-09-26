import { useState } from 'react'
import { BadgeEstadoRuta } from './Badges.jsx'
import {
  ETIQUETAS_ESTADO_RUTA,
  formatearFecha,
} from '../utils/formatos.js'

export function RutaLista({ rutas, cargando, onVer, onGenerar }) {
  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Listado de rutas</h2>
        <button className="boton boton-primario" type="button" onClick={onGenerar}>
          + Generar ruta
        </button>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehículo</th>
              <th>Pedidos</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="6" className="celda-centrada">
                  Cargando rutas…
                </td>
              </tr>
            )}
            {!cargando && rutas.length === 0 && (
              <tr>
                <td colSpan="6" className="celda-centrada">
                  No hay rutas generadas.
                </td>
              </tr>
            )}
            {!cargando &&
              rutas.map((ruta) => (
                <tr key={ruta.id}>
                  <td>
                    <div className="texto-principal">{ruta.id}</div>
                  </td>
                  <td>
                    <div className="texto-principal">
                      {ruta.vehiculo_id}
                    </div>
                    <div className="texto-secundario">
                      {ruta.pedido_ids.length} pedido(s)
                    </div>
                  </td>
                  <td>
                    <div className="texto-secundario">
                      {ruta.pedido_ids.join(', ') || '—'}
                    </div>
                  </td>
                  <td>
                    <BadgeEstadoRuta estado={ruta.estado} />
                  </td>
                  <td>
                    <span className="detalle-suave">
                      {ruta.created_at ? formatearFecha(ruta.created_at) : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button
                        className="boton boton-secundario"
                        type="button"
                        onClick={() => onVer(ruta)}
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
