import { BadgeEstadoAsignacion } from './Badges.jsx'
import {
  ETIQUETAS_TIPO_VEHICULO,
  formatearFecha,
} from '../utils/formatos.js'

export function AsignacionLista({
  asignaciones,
  mapaPedidos,
  mapaVehiculos,
  onNueva,
  onCancelar,
  cargando,
  gestionando,
}) {
  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Asignaciones de pedidos</h2>
        <button className="boton boton-primario" type="button" onClick={onNueva}>
          + Nueva asignación
        </button>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Vehículo</th>
              <th>Fecha de asignación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="5" className="celda-centrada">
                  Cargando asignaciones…
                </td>
              </tr>
            )}
            {!cargando && asignaciones.length === 0 && (
              <tr>
                <td colSpan="5" className="celda-centrada">
                  No hay asignaciones registradas.
                </td>
              </tr>
            )}
            {!cargando &&
              asignaciones.map((asignacion) => {
                const pedido = mapaPedidos[asignacion.pedido_id]
                const vehiculo = mapaVehiculos[asignacion.vehiculo_id]
                return (
                  <tr key={asignacion.id}>
                    <td>
                      <div className="texto-principal">
                        {pedido ? pedido.cliente_nombre : asignacion.pedido_id}
                      </div>
                      <div className="texto-secundario">
                        {pedido
                          ? `${pedido.peso_kg} kg · ${pedido.ventana_entrega_inicio}–${pedido.ventana_entrega_fin}`
                          : 'Pedido no encontrado'}
                      </div>
                    </td>
                    <td>
                      <div className="texto-principal">
                        {vehiculo ? vehiculo.placa : asignacion.vehiculo_id}
                      </div>
                      <div className="texto-secundario">
                        {vehiculo
                          ? `${ETIQUETAS_TIPO_VEHICULO[vehiculo.tipo] || vehiculo.tipo} · ${vehiculo.capacidad_carga_kg} kg`
                          : 'Vehículo no encontrado'}
                      </div>
                    </td>
                    <td>{formatearFecha(asignacion.fecha_asignacion)}</td>
                    <td>
                      <BadgeEstadoAsignacion estado={asignacion.estado} />
                    </td>
                    <td>
                      <div className="acciones">
                        <button
                          className="boton boton-peligro"
                          type="button"
                          disabled={
                            asignacion.estado === 'cancelada' || gestionando
                          }
                          onClick={() => onCancelar(asignacion)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </section>
  )
}