// Avisos al cliente (Sprint 4): etiquetas, formato de hora y enlaces de WhatsApp.

export const ETIQUETAS_EVENTO = {
  pedido_creado: 'Pedido recibido',
  en_camino: 'En camino',
  entregado: 'Entregado',
  no_entregado: 'No entregado',
}

const HORA = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false })
const DIA = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'short' })

export const horaLima = (iso) => (iso ? HORA.format(new Date(iso)) : '')
export const diaLima = (iso) => (iso ? DIA.format(new Date(iso)).replace('.', '') : '')

// Enlace público que recibe el cliente
export const urlSeguimiento = (token) =>
  typeof window === 'undefined' ? `/seguimiento/${token}` : `${window.location.origin}/seguimiento/${token}`

// Celulares peruanos de 9 dígitos -> 51XXXXXXXXX (formato de wa.me)
export function numeroWhatsApp(telefono) {
  const digitos = String(telefono ?? '').replace(/\D/g, '')
  if (!digitos) return ''
  return digitos.length === 9 ? `51${digitos}` : digitos
}

// Abre WhatsApp con el mensaje escrito; sin teléfono, WhatsApp pide elegir el contacto
export function enlaceWhatsApp(telefono, texto) {
  return `https://wa.me/${numeroWhatsApp(telefono)}?text=${encodeURIComponent(texto)}`
}
