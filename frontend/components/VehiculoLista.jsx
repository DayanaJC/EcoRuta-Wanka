import { Bike, Pencil, Truck } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstadoVehiculo } from './Badges.jsx'
import { EstadoVacio, FilasCargando } from './ui.jsx'
import { ETIQUETAS_TIPO_VEHICULO, formatearKg, formatearNumero } from '../utils/formatos.js'

export const IconoVehiculo = ({ tipo, size = 16 }) => (tipo === 'moto' ? <Bike size={size} aria-hidden /> : <Truck size={size} aria-hidden />)

const SEGMENTOS = [
  ['', 'Todos'],
  ['activo', 'Activos'],
  ['inactivo', 'Inactivos'],
]

export function VehiculoLista({ vehiculos, cargando, onNuevo, onVer, onEditar }) {
  const [estado, setEstado] = useState('')
  const filtrados = vehiculos.filter((v) => !estado || v.estado === estado)

  if (!cargando && vehiculos.length === 0) {
    return (
      <section className="tarjeta">
        <EstadoVacio icono={Truck} titulo="Aún no hay vehículos" descripcion="Registra la flota para poder generar rutas de reparto.">
          <button type="button" className="boton boton-primario" onClick={onNuevo}>
            Registrar vehículo
          </button>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section className="tarjeta">
      <div className="barra-filtros">
        <div className="segmentos" role="group" aria-label="Filtrar por estado">
          {SEGMENTOS.map(([valor, etiqueta]) => (
            <button key={valor} type="button" className="segmento" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>
      <div className="tabla-envoltorio">
        <table className="tabla tabla-responsiva">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Consumo</th>
              <th>Año</th>
              <th>Estado</th>
              <th className="col-acciones">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <FilasCargando columnas={7} filas={3} />
            ) : (
              filtrados.map((v) => (
                <tr key={v.id} className="fila-clic" onClick={() => onVer(v)}>
                  <td data-etiqueta="Placa">
                    <span className="texto-principal num">{v.placa}</span>
                  </td>
                  <td data-etiqueta="Tipo">
                    <span className="acciones">
                      <IconoVehiculo tipo={v.tipo} /> {ETIQUETAS_TIPO_VEHICULO[v.tipo]}
                    </span>
                  </td>
                  <td data-etiqueta="Capacidad" className="num">
                    <div>
                      {formatearKg(v.capacidad_carga_kg)}
                      <div className="texto-secundario">{formatearNumero(v.capacidad_volumen_m3)} m³ útiles</div>
                    </div>
                  </td>
                  <td data-etiqueta="Consumo" className="num">
                    {formatearNumero(v.consumo_combustible_l100km)} L/100 km
                  </td>
                  <td data-etiqueta="Año" className="num">
                    {v.anio_fabricacion}
                  </td>
                  <td data-etiqueta="Estado">
                    <BadgeEstadoVehiculo estado={v.estado} />
                  </td>
                  <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="boton boton-fantasma boton-icono"
                      onClick={() => onEditar(v)}
                      aria-label={`Editar vehículo ${v.placa}`}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
