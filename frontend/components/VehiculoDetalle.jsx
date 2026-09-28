import { Power, PowerOff } from 'lucide-react'
import { BadgeEstadoRuta, BadgeEstadoVehiculo } from './Badges.jsx'
import { navegar } from './navegacion.js'
import { Aviso, EstadoVacio } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'
import {
  ETIQUETAS_TIPO_VEHICULO,
  formatearFecha,
  formatearFechaCorta,
  formatearKg,
  formatearKm,
  formatearNumero,
} from '../utils/formatos.js'

export function VehiculoDetalle({ vehiculo, rutas, onCambiarEstado, gestionando }) {
  const activo = vehiculo.estado === 'activo'

  return (
    <div className="pila">
      {!activo && <Aviso tipo="alerta">Este vehículo está inactivo: no aparece al generar rutas.</Aviso>}

      <div className="rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2 className="acciones">
              <IconoVehiculo tipo={vehiculo.tipo} size={18} /> {ETIQUETAS_TIPO_VEHICULO[vehiculo.tipo]}
            </h2>
            <BadgeEstadoVehiculo estado={vehiculo.estado} />
          </div>
          <div className="tarjeta-cuerpo">
            <dl className="datos">
              <div>
                <dt>Capacidad</dt>
                <dd className="num">{formatearKg(vehiculo.capacidad_carga_kg)}</dd>
              </div>
              <div>
                <dt>Volumen útil</dt>
                <dd className="num">
                  {formatearNumero(vehiculo.capacidad_volumen_m3)} m³
                  <div className="texto-secundario">al {vehiculo.aprovechamiento_pct} % de aprovechamiento</div>
                </dd>
              </div>
              <div>
                <dt>Espacio de carga</dt>
                <dd className="num">
                  {vehiculo.largo_util_cm} × {vehiculo.ancho_util_cm} × {vehiculo.alto_util_cm} cm
                </dd>
              </div>
              <div>
                <dt>Consumo</dt>
                <dd className="num">{formatearNumero(vehiculo.consumo_combustible_l100km)} L/100 km</dd>
              </div>
              <div>
                <dt>Factor CO₂</dt>
                <dd className="num">{formatearNumero(vehiculo.factor_emision_co2_kg_l)} kg/L</dd>
              </div>
              <div>
                <dt>Año</dt>
                <dd className="num">{vehiculo.anio_fabricacion}</dd>
              </div>
              <div>
                <dt>Registrado</dt>
                <dd>{formatearFecha(vehiculo.created_at)}</dd>
              </div>
            </dl>
          </div>
          <div className="barra-acciones">
            {activo ? (
              <button type="button" className="boton boton-peligro" onClick={() => onCambiarEstado('inactivo')} disabled={gestionando}>
                <PowerOff size={16} aria-hidden /> Desactivar vehículo
              </button>
            ) : (
              <button type="button" className="boton boton-primario" onClick={() => onCambiarEstado('activo')} disabled={gestionando}>
                <Power size={16} aria-hidden /> Reactivar vehículo
              </button>
            )}
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Rutas del vehículo</h2>
          </div>
          {rutas.length === 0 ? (
            <EstadoVacio titulo="Sin rutas" descripcion="Este vehículo todavía no tiene rutas generadas." />
          ) : (
            <table className="tabla">
              <tbody>
                {rutas.slice(0, 6).map((r) => (
                  <tr key={r.id} className="fila-clic" onClick={() => navegar({ vista: 'rutas', accion: 'ver', id: r.id })}>
                    <td>
                      <div className="texto-principal">{formatearFechaCorta(r.fecha)}</div>
                      <div className="texto-secundario num">
                        Salida {r.hora_salida} · {r.pedido_ids.length} paradas · {formatearKm(r.distancia_estimada_km)}
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
