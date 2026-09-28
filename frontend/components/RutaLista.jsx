import { BadgeEstadoRuta } from './Badges.jsx'
import { formatearDuracion } from '../utils/formatos.js'

export function RutaLista({ rutas, vehiculos, cargando, onVer, onGenerar }) {
  const placa = (id) => vehiculos.find((v) => v.id === id)?.placa ?? id

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
              <th>Fecha</th>
              <th>Vehículo</th>
              <th>Paradas</th>
              <th>Distancia</th>
              <th>Tiempo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="7" className="celda-centrada">
                  Cargando rutas…
                </td>
              </tr>
            )}
            {!cargando && rutas.length === 0 && (
              <tr>
                <td colSpan="7" className="celda-centrada">
                  No hay rutas generadas.
                </td>
              </tr>
            )}
            {!cargando &&
              rutas.map((ruta) => (
                <tr key={ruta.id}>
                  <td>
                    <div className="texto-principal">{ruta.fecha ?? '—'}</div>
                    <div className="texto-secundario">salida {ruta.hora_salida ?? '—'}</div>
                  </td>
                  <td>
                    <div className="texto-principal">{placa(ruta.vehiculo_id)}</div>
                  </td>
                  <td>{ruta.pedido_ids.length}</td>
                  <td>{ruta.distancia_estimada_km != null ? `${ruta.distancia_estimada_km} km` : '—'}</td>
                  <td>{formatearDuracion(ruta.tiempo_estimado_min)}</td>
                  <td>
                    <BadgeEstadoRuta estado={ruta.estado} />
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="boton boton-secundario" type="button" onClick={() => onVer(ruta)}>
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
