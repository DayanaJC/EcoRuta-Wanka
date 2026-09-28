// Etiquetas en español, tonos de color y formatos de presentación.

export const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const ETIQUETAS_ESTADO_VEHICULO = {
  activo: 'Activo',
  inactivo: 'Inactivo',
}

export const ETIQUETAS_ESTADO_ASIGNACION = {
  asignada: 'Asignada',
  cancelada: 'Cancelada',
}

export const ETIQUETAS_ESTADO_RUTA = {
  generada: 'Generada',
  en_reparto: 'En reparto',
  completada: 'Completada',
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

export const ETIQUETAS_TIPO = {
  perecedero: 'Perecedero',
  no_perecedero: 'No perecedero',
}

// Tonos definidos en globals.css (.tono-*)
export const TONOS = {
  pedido: { pendiente: 'azul', en_ruta: 'ambar', entregado: 'verde', cancelado: 'gris' },
  vehiculo: { activo: 'verde', inactivo: 'gris' },
  asignacion: { asignada: 'verde', cancelada: 'gris' },
  ruta: { generada: 'azul', en_reparto: 'ambar', completada: 'verde', cancelada: 'gris' },
  prioridad: { express: 'rojo', estandar: 'violeta', economico: 'gris' },
}

export const ESTADOS_TERMINALES_PEDIDO = ['entregado', 'cancelado']

const numero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })

export const formatearNumero = (n) => (n == null ? '—' : numero.format(n))
export const formatearKg = (n) => (n == null ? '—' : `${numero.format(n)} kg`)
export const formatearKm = (n) => (n == null ? '—' : `${numero.format(n)} km`)

export function formatearFecha(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
}

// "2026-09-28" -> "lun. 28 sept. 2026"
export function formatearFechaCorta(yyyymmdd) {
  if (!yyyymmdd) return '—'
  return new Date(`${yyyymmdd}T12:00:00`).toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatearVentana(pedido) {
  return `${pedido.ventana_entrega_inicio} – ${pedido.ventana_entrega_fin}`
}

// 95 -> "1 h 35 min"
export function formatearDuracion(minutos) {
  if (minutos == null) return '—'
  return minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)} h ${minutos % 60} min`
}

// "08:00" + 95 min -> "09:35"
export function sumarMinutos(hhmm, minutos) {
  if (!hhmm || minutos == null) return '—'
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutos
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// "08:00", "11:43" -> 223
export function minutosEntre(desde, hasta) {
  const aMin = (hhmm) => hhmm.split(':').map(Number).reduce((h, m) => h * 60 + m)
  return aMin(hasta) - aMin(desde)
}

// Fecha de hoy en Huancayo (America/Lima) como "YYYY-MM-DD"
export function hoyEnLima() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date())
}

// Búsqueda sin tildes ni mayúsculas
export const normalizar = (texto) =>
  (texto ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
