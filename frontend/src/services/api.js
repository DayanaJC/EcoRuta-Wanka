const BASE = '/api/v1'

async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
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
  listarAsignaciones: () => pedir('/asignaciones'),
  obtenerAsignacion: (id) => pedir(`/asignaciones/${id}`),
  crearAsignacion: (datos) =>
    pedir('/asignaciones', { method: 'POST', body: JSON.stringify(datos) }),
  asignacionesPorPedido: (pedidoId) => pedir(`/asignaciones/pedido/${pedidoId}`),
  asignacionesPorVehiculo: (vehiculoId) =>
    pedir(`/asignaciones/vehiculo/${vehiculoId}`),
  cancelarAsignacion: (id) =>
    pedir(`/asignaciones/${id}`, { method: 'DELETE' }),
  generarRuta: (datos) =>
    pedir('/rutas', { method: 'POST', body: JSON.stringify(datos) }),
}