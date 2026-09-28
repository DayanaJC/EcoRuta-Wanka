// Navegación basada en la URL (?vista=pedidos&accion=ver&id=...).
// Permite usar Atrás/Adelante del navegador, recargar sin perder la pantalla
// y compartir enlaces directos a una ruta o pedido.

import { useSyncExternalStore } from 'react'

export const VISTA_INICIAL = 'pedidos'

const EVENTO = 'ecoruta:navegacion'

function suscribir(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener(EVENTO, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(EVENTO, callback)
  }
}

export function useUbicacion() {
  const busqueda = useSyncExternalStore(
    suscribir,
    () => window.location.search,
    () => '',
  )
  const params = new URLSearchParams(busqueda)
  return {
    vista: params.get('vista') || VISTA_INICIAL,
    accion: params.get('accion') || 'lista',
    id: params.get('id'),
  }
}

export function navegar({ vista, accion, id } = {}, { reemplazar = false } = {}) {
  const params = new URLSearchParams()
  if (vista && vista !== VISTA_INICIAL) params.set('vista', vista)
  if (accion && accion !== 'lista') params.set('accion', accion)
  if (id) params.set('id', id)
  const url = `${window.location.pathname}${params.size ? `?${params}` : ''}`
  window.history[reemplazar ? 'replaceState' : 'pushState'](null, '', url)
  window.dispatchEvent(new Event(EVENTO))
  window.scrollTo({ top: 0 })
}
