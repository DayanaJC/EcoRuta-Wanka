// URL de la API REST del backend (Node.js + Express). Ver frontend/.env.example
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
const TIMEOUT_MS = 15000

// Mensaje de error de la API ({ detail }) o uno genérico con el código HTTP
async function detalleError(respuesta) {
  try {
    const cuerpo = await respuesta.json()
    if (cuerpo.detail) return typeof cuerpo.detail === 'string' ? cuerpo.detail : JSON.stringify(cuerpo.detail)
  } catch {
    // sin cuerpo JSON: se queda el mensaje generico
  }
  return `Error del servidor (${respuesta.status}).`
}

async function pedir(ruta, opciones = {}) {
  const controlador = new AbortController()
  const id = setTimeout(() => controlador.abort(), TIMEOUT_MS)

  try {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
      signal: controlador.signal,
    })

    if (!respuesta.ok) throw new Error(await detalleError(respuesta))

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
  listarFactoresTrafico: () => pedir('/factores-trafico'),
  geocodificar: (texto) => pedir(`/geocodificar${aQueryParams({ q: texto })}`),
  // Dirección de un punto marcado en el mapa (null si no hay ninguna cerca)
  geocodificarInversa: (lat, lon) => pedir(`/geocodificar/inversa${aQueryParams({ lat, lon })}`),
  listarConductores: (params = {}) => pedir(`/conductores${aQueryParams(params)}`),
  crearConductor: (datos) =>
    pedir('/conductores', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarConductor: (id, datos) =>
    pedir(`/conductores/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  cambiarEstadoConductor: (id, estado) =>
    pedir(`/conductores/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  // params: { desde, hasta, vehiculo_id, conductor_id, geometria: 'true' }
  listarRutas: (params = {}) => pedir(`/rutas${aQueryParams(params)}`),
  // conductor_id null = quitar el conductor
  asignarConductor: (rutaId, conductorId) =>
    pedir(`/rutas/${rutaId}/conductor`, {
      method: 'PATCH',
      body: JSON.stringify({ conductor_id: conductorId }),
    }),
  // Sostenibilidad: { desde, hasta, vehiculo_id }
  indicadores: (params = {}) => pedir(`/indicadores${aQueryParams(params)}`),
  // Devuelve el PDF como Blob (o un Error con el detalle si no hay datos)
  async reporteSostenibilidad(params = {}) {
    const respuesta = await fetch(`${BASE}/reportes/sostenibilidad.pdf${aQueryParams(params)}`)
    if (!respuesta.ok) throw new Error(await detalleError(respuesta))
    return respuesta.blob()
  },
  obtenerRuta: (id) => pedir(`/rutas/${id}`),
  generarRuta: (datos) =>
    pedir('/rutas', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarEstadoRuta: (id, estado) =>
    pedir(`/rutas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  cancelarRuta: (id) => pedir(`/rutas/${id}`, { method: 'DELETE' }),
  // resultado: 'entregada' | 'no_entregada' (este último con motivo)
  registrarEntrega: (rutaId, orden, cuerpo) =>
    pedir(`/rutas/${rutaId}/paradas/${orden}`, {
      method: 'PATCH',
      body: JSON.stringify(cuerpo),
    }),
  simularRuta: (id, opciones = {}) =>
    pedir(`/rutas/${id}/simular`, { method: 'POST', body: JSON.stringify(opciones) }),
}
