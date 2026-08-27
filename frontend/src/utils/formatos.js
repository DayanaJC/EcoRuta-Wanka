export const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const ETIQUETAS_PRIORIDAD = {
  express: 'Express',
  estandar: 'Estándar',
  economico: 'Económico',
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