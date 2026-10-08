// Conductor de una ruta (RF-08): muestra el asignado y permite asignar, cambiar o quitar.
// La API vuelve a validar la disponibilidad (RN-009); aquí solo se avisa de antemano.

import { IdCard, Phone, UserRoundX } from 'lucide-react'
import { useState } from 'react'
import { navegar } from './navegacion.js'
import { sumarMinutos } from '../utils/formatos.js'

const aMin = (hhmm) => hhmm.split(':').map(Number).reduce((h, m) => h * 60 + m)

// Ruta activa del conductor que se cruza en horario con `ruta` (mismo día)
export function rutaQueSeCruza(conductorId, ruta, rutas) {
  const inicio = aMin(ruta.hora_salida)
  const fin = inicio + (ruta.tiempo_estimado_min ?? 0)
  return rutas.find(
    (r) =>
      r.id !== ruta.id &&
      r.conductor_id === conductorId &&
      r.fecha === ruta.fecha &&
      (r.estado === 'generada' || r.estado === 'en_reparto') &&
      aMin(r.hora_salida) < fin &&
      inicio < aMin(r.hora_salida) + (r.tiempo_estimado_min ?? 0),
  )
}

export function ConductorRuta({ ruta, conductores, rutas, onAsignar, gestionando }) {
  const [editando, setEditando] = useState(false)
  const [elegido, setElegido] = useState('')
  const asignado = conductores.find((c) => c.id === ruta.conductor_id)
  const editable = ruta.estado === 'generada' || ruta.estado === 'en_reparto'
  const activos = conductores.filter((c) => c.estado === 'activo' && c.id !== ruta.conductor_id)
  const ocupado = Object.fromEntries(activos.map((c) => [c.id, rutaQueSeCruza(c.id, ruta, rutas)]))

  const confirmar = async (e) => {
    e.preventDefault()
    if (!elegido) return
    await onAsignar(elegido)
    setEditando(false)
    setElegido('')
  }

  return (
    <section className="tarjeta conductor-ruta" aria-label="Conductor de la ruta">
      <div className="indicador-icono tono-violeta">
        <IdCard size={18} aria-hidden />
      </div>
      <div className="conductor-ruta-cuerpo">
        <div className="indicador-etiqueta">Conductor</div>
        {asignado ? (
          <div className="acciones">
            <button type="button" className="enlace texto-principal" onClick={() => navegar({ vista: 'conductores', accion: 'ver', id: asignado.id })}>
              {asignado.nombre}
            </button>
            <span className="texto-secundario num">
              DNI {asignado.dni}
              {asignado.licencia && ` · Licencia ${asignado.licencia}`}
            </span>
            {asignado.telefono && (
              <a className="acciones texto-secundario num no-imprimir" href={`tel:${asignado.telefono}`}>
                <Phone size={13} aria-hidden /> {asignado.telefono}
              </a>
            )}
            <span className="solo-impresion num">{asignado.telefono}</span>
          </div>
        ) : (
          <div className="texto-secundario">{editable ? 'Sin conductor asignado' : 'La ruta se hizo sin conductor asignado'}</div>
        )}

        {editable && editando && (
          <form className="acciones no-imprimir" style={{ marginTop: 10, flexWrap: 'wrap' }} onSubmit={confirmar}>
            <select
              className="campo"
              style={{ maxWidth: 360 }}
              value={elegido}
              onChange={(e) => setElegido(e.target.value)}
              aria-label="Elegir conductor"
              autoFocus
              required
            >
              <option value="">{activos.length ? 'Elige un conductor…' : 'No hay otros conductores activos'}</option>
              {activos.map((c) => {
                const cruce = ocupado[c.id]
                return (
                  <option key={c.id} value={c.id} disabled={Boolean(cruce)}>
                    {c.nombre}
                    {cruce ? ` — ocupado de ${cruce.hora_salida} a ${sumarMinutos(cruce.hora_salida, cruce.tiempo_estimado_min)}` : ''}
                  </option>
                )
              })}
            </select>
            <button type="submit" className="boton boton-primario boton-sm" disabled={gestionando || !elegido}>
              Asignar
            </button>
            <button type="button" className="boton boton-secundario boton-sm" onClick={() => setEditando(false)}>
              Volver
            </button>
          </form>
        )}
      </div>

      {editable && !editando && (
        <div className="acciones no-imprimir">
          {asignado && ruta.estado === 'generada' && (
            <button type="button" className="boton boton-fantasma boton-sm" onClick={() => onAsignar(null)} disabled={gestionando}>
              <UserRoundX size={15} aria-hidden /> Quitar
            </button>
          )}
          <button type="button" className={`boton boton-sm ${asignado ? 'boton-secundario' : 'boton-primario'}`} onClick={() => setEditando(true)} disabled={gestionando}>
            {asignado ? 'Cambiar conductor' : 'Asignar conductor'}
          </button>
        </div>
      )}
    </section>
  )
}
