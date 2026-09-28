import { useState } from 'react'
import { BadgeEstado } from './Badges.jsx'
import { ETIQUETAS_ESTADO } from '../utils/formatos.js'

const OPCIONES_ESTADO = Object.entries(ETIQUETAS_ESTADO).map(
  ([valor, etiqueta]) => ({ valor, etiqueta }),
)

export function VehiculoDetalle({ vehiculo, onCambiarEstado, onEditar, onVolver, gestionando }) {
  const esTerminal = vehiculo.estado === 'inactivo'
  const [estadoNuevo, setEstadoNuevo] = useState(vehiculo.estado)

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Detalle del vehículo</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver al listado
        </button>
      </div>

      <div className="detalle-mallas">
        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Identificación</h3>
            <p className="detalle-fuerte">{vehiculo.placa}</p>
            <p className="detalle-suave">Tipo: {vehiculo.tipo || vehiculo.tipo_vehiculo}</p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Estado</h3>
            <p>
              <BadgeEstado estado={vehiculo.estado} />
            </p>
            <p className="detalle-suave">
              Creado: {vehiculo.created_at ? new Date(vehiculo.created_at).toLocaleDateString('es-PE') : '—'}
            </p>
          </div>
        </div>

        <div className="fila-dos-columnas">
          <div className="tarjeta-detalle">
            <h3>Capacidad y rendimiento</h3>
            <p className="detalle-fuerte">
              {vehiculo.capacidad_carga_kg} kg · {vehiculo.consumo_combustible_l100km} L/100km
            </p>
            <p className="detalle-suave">
              Factor CO₂: {vehiculo.factor_emision_co2_kg_l} kg/L · Año: {vehiculo.anio_fabricacion}
            </p>
          </div>
          <div className="tarjeta-detalle">
            <h3>Acciones</h3>
            {!esTerminal && (
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
                  disabled={gestionando || estadoNuevo === vehiculo.estado}
                  onClick={() => onCambiarEstado(vehiculo, estadoNuevo)}
                >
                  Aplicar estado
                </button>
              </div>
            )}
            <button
              className="boton boton-secundario"
              type="button"
              onClick={() => onEditar(vehiculo)}
              disabled={gestionando}
            >
              Editar vehículo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
