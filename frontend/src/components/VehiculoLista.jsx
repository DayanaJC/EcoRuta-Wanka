import { BadgeEstado } from './Badges.jsx'
import { ETIQUETAS_ESTADO } from '../utils/formatos.js'

const OPCIONES_ESTADO = Object.entries(ETIQUETAS_ESTADO).map(
  ([valor, etiqueta]) => ({ valor, etiqueta }),
)

export function VehiculoLista({ vehiculos, cargando, onEditar, onVer }) {
  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Listado de vehículos</h2>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="5" className="celda-centrada">
                  Cargando vehículos…
                </td>
              </tr>
            )}
            {!cargando && vehiculos.length === 0 && (
              <tr>
                <td colSpan="5" className="celda-centrada">
                  No hay vehículos registrados.
                </td>
              </tr>
            )}
            {!cargando &&
              vehiculos.map((vehiculo) => (
                <tr key={vehiculo.id}>
                  <td>
                    <div className="texto-principal">{vehiculo.placa}</div>
                  </td>
                  <td>
                    <div className="texto-principal">
                      {vehiculo.tipo || vehiculo.tipo_vehiculo}
                    </div>
                  </td>
                  <td>
                    <div className="texto-principal">
                      {vehiculo.capacidad_carga_kg} kg
                    </div>
                  </td>
                  <td>
                    <BadgeEstado estado={vehiculo.estado} />
                  </td>
                  <td>
                    <div className="acciones">
                      <button
                        className="boton boton-secundario"
                        type="button"
                        onClick={() => onVer(vehiculo)}
                      >
                        Ver
                      </button>
                      <button
                        className="boton boton-secundario"
                        type="button"
                        onClick={() => onEditar(vehiculo)}
                      >
                        Editar
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
