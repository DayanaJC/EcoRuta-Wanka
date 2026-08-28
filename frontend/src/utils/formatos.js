export const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const ETIQUETAS_ESTADO_ASIGNACION = {
  asignada: 'Asignada',
  cancelada: 'Cancelada',
}

export const ETIQUETAS_TIPO_VEHICULO = {
  camioneta: 'Camioneta',
  furgon: 'Furgón',
  moto: 'Moto',
}

export const ETIQUETAS_PRIORIDAD = {
  express: 'Express',
  estandar: 'Estándar',
  economico: 'Económico',
}

export const ETIQUETAS_MOTIVO_EXCLUSION = {
  sin_coordenadas: 'Sin coordenadas',
  pedido_no_encontrado: 'Pedido no encontrado',
  estado_no_entregable: 'Estado no entregable',
}

export const ETIQUETAS_TIPO = {
  perecedero: 'Perecedero',
  no_perecedero: 'No perecedero',
}

export const COLORES_ESTADO = {
  pendiente: '#2563eb',
  en_ruta: '#d97706',
  entregado: '#16a34a',
  cancelado: '#b91c1c',
}

export const COLORES_ESTADO_ASIGNACION = {
  asignada: '#16a34a',
  cancelada: '#b91c1c',
}

export const COLORES_PRIORIDAD = {
  express: '#b91c1c',
  estandar: '#d97706',
  economico: '#2563eb',
}

export function formatearFecha(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatearVentana(pedido) {
  return `${pedido.ventana_entrega_inicio} – ${pedido.ventana_entrega_fin}`
}

export function formatearMinutos(total) {
  if (!total && total !== 0) return '—'
  const minutos = Math.round(total)
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

export function sumarMinutos(hora, minutos) {
  const [horas, m] = String(hora).split(':').map(Number)
  const total = horas * 60 + m + Math.round(minutos)
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function formatearKm(valor) {
  if (valor === null || valor === undefined) return '—'
  return `${valor.toLocaleString('es-PE', { maximumFractionDigits: 2 })} km`
}

export function formatearLitros(valor) {
  if (valor === null || valor === undefined) return '—'
  return `${valor.toLocaleString('es-PE', {
    maximumFractionDigits: 2,
  })} l`
}

export function formatearCO2(valor) {
  if (valor === null || valor === undefined) return '—'
  return `${valor.toLocaleString('es-PE', {
    maximumFractionDigits: 2,
  })} kg CO₂`
}