import {
  COLORES_ESTADO,
  COLORES_ESTADO_ASIGNACION,
  COLORES_PRIORIDAD,
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_ASIGNACION,
  ETIQUETAS_PRIORIDAD,
} from '../utils/formatos.js'

export function BadgeEstado({ estado }) {
  return (
    <span
      className="badge"
      style={{ backgroundColor: COLORES_ESTADO[estado] || '#6b7280' }}
    >
      {ETIQUETAS_ESTADO[estado] || estado}
    </span>
  )
}

export function BadgeEstadoAsignacion({ estado }) {
  return (
    <span
      className="badge"
      style={{ backgroundColor: COLORES_ESTADO_ASIGNACION[estado] || '#6b7280' }}
    >
      {ETIQUETAS_ESTADO_ASIGNACION[estado] || estado}
    </span>
  )
}

export function BadgePrioridad({ prioridad }) {
  return (
    <span
      className="badge"
      style={{ backgroundColor: COLORES_PRIORIDAD[prioridad] || '#6b7280' }}
    >
      {ETIQUETAS_PRIORIDAD[prioridad] || prioridad}
    </span>
  )
}