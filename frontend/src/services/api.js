const BASE = '/api/v1'
const TIMEOUT_MS = 15000

async function pedir(ruta, opciones = {}) {
  const controlador = new AbortController()
  const id = setTimeout(() => controlador.abort(), TIMEOUT_MS)

  try {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
      signal: controlador.signal,
    })

    if (!respuesta.ok) {
      let detalle = `Error del servidor (${respuesta.status}).`
      try {
        const cuerpo = await respuesta.json()
        if (cuerpo.detail) {
          detalle =
            typeof cuerpo.detail === 'string'
              ? cuerpo.detail
              : JSON.stringify(cuerpo.detail)
        }
      } catch {
        // sin cuerpo JSON: se queda el mensaje generico
      }
      throw new Error(detalle)
    }

    if (respuesta.status === 204) return null
    return respuesta.json()
  } finally {
    clearTimeout(id)
  }
}

function aQueryParams(params) {
  const q = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      q.append(clave, valor)
    }
  }
  const texto = q.toString()
  return texto ? `?${texto}` : ''
}

export const api = {
  listarPedidos: (params = {}) => pedir(`/pedidos${aQueryParams(params)}`),
  obtenerPedido: (id) => pedir(`/pedidos/${id}`),
  crearPedido: (datos) =>
    pedir('/pedidos', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarPedido: (id, datos) =>
    pedir(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  cambiarEstado: (id, estado) =>
    pedir(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  cancelarPedido: (id) => pedir(`/pedidos/${id}`, { method: 'DELETE' }),
  listarVehiculos: (params = {}) => pedir(`/vehiculos${aQueryParams(params)}`),
  obtenerVehiculo: (id) => pedir(`/vehiculos/${id}`),
  crearVehiculo: (datos) =>
    pedir('/vehiculos', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarVehiculo: (id, datos) =>
    pedir(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  cambiarEstadoVehiculo: (id, estado) =>
    pedir(`/vehiculos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  desactivarVehiculo: (id) =>
    pedir(`/vehiculos/${id}`, { method: 'DELETE' }),
  listarAsignaciones: () => pedir('/asignaciones'),
  obtenerAsignacion: (id) => pedir(`/asignaciones/${id}`),
  crearAsignacion: (datos) =>
    pedir('/asignaciones', { method: 'POST', body: JSON.stringify(datos) }),
  asignacionesPorPedido: (pedidoId) => pedir(`/asignaciones/pedido/${pedidoId}`),
  asignacionesPorVehiculo: (vehiculoId) =>
    pedir(`/asignaciones/vehiculo/${vehiculoId}`),
  cancelarAsignacion: (id) =>
    pedir(`/asignaciones/${id}`, { method: 'DELETE' }),
  listarRutas: () => pedir('/rutas'),
  obtenerRuta: (id) => pedir(`/rutas/${id}`),
  generarRuta: (datos) =>
    pedir('/rutas', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarEstadoRuta: (id, estado) =>
    pedir(`/rutas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  cancelarRuta: (id) => pedir(`/rutas/${id}`, { method: 'DELETE' }),
}
