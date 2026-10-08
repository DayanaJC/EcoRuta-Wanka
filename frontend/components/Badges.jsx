import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_ASIGNACION,
  ETIQUETAS_ESTADO_CONDUCTOR,
  ETIQUETAS_ESTADO_PARADA,
  ETIQUETAS_ESTADO_RUTA,
  ETIQUETAS_ESTADO_VEHICULO,
  ETIQUETAS_PRIORIDAD,
  TONOS,
} from '../utils/formatos.js'

function Badge({ tono = 'gris', children }) {
  return <span className={`badge tono-${tono}`}>{children}</span>
}

export const BadgeEstado = ({ estado }) => <Badge tono={TONOS.pedido[estado]}>{ETIQUETAS_ESTADO[estado] ?? estado}</Badge>

export const BadgeEstadoVehiculo = ({ estado }) => (
  <Badge tono={TONOS.vehiculo[estado]}>{ETIQUETAS_ESTADO_VEHICULO[estado] ?? estado}</Badge>
)

export const BadgeEstadoConductor = ({ estado }) => (
  <Badge tono={TONOS.conductor[estado]}>{ETIQUETAS_ESTADO_CONDUCTOR[estado] ?? estado}</Badge>
)

export const BadgeEstadoAsignacion = ({ estado }) => (
  <Badge tono={TONOS.asignacion[estado]}>{ETIQUETAS_ESTADO_ASIGNACION[estado] ?? estado}</Badge>
)

export const BadgeEstadoRuta = ({ estado }) => <Badge tono={TONOS.ruta[estado]}>{ETIQUETAS_ESTADO_RUTA[estado] ?? estado}</Badge>

export const BadgeEstadoParada = ({ estado }) => <Badge tono={TONOS.parada[estado]}>{ETIQUETAS_ESTADO_PARADA[estado] ?? estado}</Badge>

export const BadgePrioridad = ({ prioridad }) => (
  <Badge tono={TONOS.prioridad[prioridad]}>{ETIQUETAS_PRIORIDAD[prioridad] ?? prioridad}</Badge>
)
