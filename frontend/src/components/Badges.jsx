import {
  COLORES_ESTADO,
  COLORES_PRIORIDAD,
  ETIQUETAS_ESTADO,
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