'use client'

// Estructura general: barra lateral, datos compartidos, avisos y confirmaciones.
// Cada módulo se encarga de su propia lista, formulario y detalle.

import { ChartColumn, IdCard, Leaf, Package, Route, Store, Truck } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { Pedidos } from './modulos/Pedidos.jsx'
import { navegar, useUbicacion } from './navegacion.js'
import { DialogoConfirmacion, Toasts } from './ui.jsx'

// Carga diferida (Green IT): Pedidos es la vista inicial; el resto de módulos
// se descarga solo cuando el usuario lo abre.
const Clientes = lazy(() => import('./modulos/Clientes.jsx').then((m) => ({ default: m.Clientes })))
const Vehiculos = lazy(() => import('./modulos/Vehiculos.jsx').then((m) => ({ default: m.Vehiculos })))
const Conductores = lazy(() => import('./modulos/Conductores.jsx').then((m) => ({ default: m.Conductores })))
const Rutas = lazy(() => import('./modulos/Rutas.jsx').then((m) => ({ default: m.Rutas })))
const Sostenibilidad = lazy(() => import('./modulos/Sostenibilidad.jsx').then((m) => ({ default: m.Sostenibilidad })))

function CargandoModulo() {
  return (
    <div className="tarjeta" role="status" aria-label="Cargando módulo">
      <div className="tarjeta-cuerpo">
        <span className="esqueleto" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

// Módulos ocultos por ahora (sus archivos siguen en components/modulos/):
// - Resumen: agregarlo como primer elemento y cambiar VISTA_INICIAL en navegacion.js.
// - Asignaciones: { id: 'asignaciones', etiqueta: 'Asignaciones', icono: Link2, componente: Asignaciones }.
const MODULOS = [
  { id: 'pedidos', etiqueta: 'Pedidos', icono: Package, componente: Pedidos, necesita: ['pedidos'] },
  { id: 'clientes', etiqueta: 'Clientes', icono: Store, componente: Clientes },
  { id: 'vehiculos', etiqueta: 'Vehículos', icono: Truck, componente: Vehiculos },
  { id: 'conductores', etiqueta: 'Conductores', icono: IdCard, componente: Conductores },
  { id: 'rutas', etiqueta: 'Rutas', icono: Route, componente: Rutas },
  { id: 'sostenibilidad', etiqueta: 'Sostenibilidad', etiquetaCorta: 'Indicadores', icono: ChartColumn, componente: Sostenibilidad },
]

const CARGADORES = {
  pedidos: () => api.listarPedidos(),
  vehiculos: () => api.listarVehiculos(),
  conductores: () => api.listarConductores(),
  clientes: () => api.listarClientes(),
  asignaciones: () => api.listarAsignaciones(),
  rutas: () => api.listarRutas(),
}

// Carga inicial: las asignaciones solo las usa Rutas y se piden al abrirlo (Green IT)
const CLAVES_INICIALES = Object.keys(CARGADORES).filter((c) => c !== 'asignaciones')

function useDatos(notificar) {
  const [datos, setDatos] = useState({ pedidos: [], vehiculos: [], conductores: [], clientes: [], asignaciones: [], rutas: [] })
  // Conjuntos de la carga inicial que aún no llegan: cada tabla se dibuja en cuanto
  // llega su propia respuesta, sin esperar a la más lenta (mejora el LCP).
  const [pendientes, setPendientes] = useState(() => new Set(CLAVES_INICIALES))
  const llego = useCallback((clave) => setPendientes((prev) => {
    if (!prev.has(clave)) return prev
    const siguiente = new Set(prev)
    siguiente.delete(clave)
    return siguiente
  }), [])

  const recargar = useCallback(
    async (...claves) => {
      const lista = claves.length ? claves : Object.keys(CARGADORES)
      try {
        const resultados = await Promise.all(lista.map((c) => CARGADORES[c]()))
        setDatos((prev) => ({ ...prev, ...Object.fromEntries(lista.map((c, i) => [c, resultados[i]])) }))
      } catch (e) {
        notificar('error', `No se pudo cargar la información: ${e.message}`)
      } finally {
        lista.forEach(llego)
      }
    },
    [notificar, llego],
  )

  useEffect(() => {
    let activo = true
    let avisado = false
    for (const clave of CLAVES_INICIALES) {
      CARGADORES[clave]()
        .then((valor) => activo && setDatos((prev) => ({ ...prev, [clave]: valor })))
        .catch((e) => {
          if (activo && !avisado) notificar('error', `No se pudo conectar con el servidor: ${e.message}`)
          avisado = true
        })
        .finally(() => activo && llego(clave))
    }
    return () => {
      activo = false
    }
  }, [notificar, llego])

  return { datos, pendientes, recargar }
}

export default function App() {
  const ubicacion = useUbicacion()
  const [avisos, setAvisos] = useState([])
  const [solicitud, setSolicitud] = useState(null)

  const notificar = useCallback((tipo, texto) => {
    setAvisos((prev) => [...prev.slice(-3), { id: crypto.randomUUID(), tipo, texto }])
  }, [])
  const cerrarAviso = useCallback((id) => setAvisos((prev) => prev.filter((a) => a.id !== id)), [])

  // confirmar({ titulo, mensaje, textoConfirmar, peligro }) -> Promise<boolean>
  const confirmar = useCallback((opciones) => new Promise((resolver) => setSolicitud({ ...opciones, resolver })), [])
  const responder = (respuesta) => {
    solicitud?.resolver(respuesta)
    setSolicitud(null)
  }

  const { datos, pendientes, recargar } = useDatos(notificar)
  const modulo = MODULOS.find((m) => m.id === ubicacion.vista) ?? MODULOS[0]
  const Modulo = modulo.componente
  // Un módulo con `necesita` espera solo esos datos; el resto, toda la carga inicial
  const cargando = (modulo.necesita ?? CLAVES_INICIALES).some((c) => pendientes.has(c))

  useEffect(() => {
    if (modulo.id === 'rutas') recargar('asignaciones')
  }, [modulo.id, recargar])

  const contadores = {
    pedidos: datos.pedidos.filter((p) => p.estado === 'pendiente').length,
    rutas: datos.rutas.filter((r) => r.estado === 'generada' || r.estado === 'en_reparto').length,
  }

  // En la barra inferior del móvil se usa la etiqueta corta (si la hay)
  const itemsNav = (corta) => MODULOS.map((m) => {
    const Icono = m.icono
    return (
      <button
        key={m.id}
        type="button"
        className="nav-item"
        aria-current={m.id === modulo.id ? 'page' : undefined}
        onClick={() => navegar({ vista: m.id })}
      >
        <Icono size={19} aria-hidden />
        <span>{(corta && m.etiquetaCorta) || m.etiqueta}</span>
        {contadores[m.id] > 0 && (
          <span className="nav-contador" aria-label={`${contadores[m.id]} pendientes`}>
            {contadores[m.id]}
          </span>
        )}
      </button>
    )
  })

  return (
    <div className="app">
      <aside className="lateral">
        <div className="marca">
          <div className="marca-logo">
            <Leaf size={20} aria-hidden />
          </div>
          <div>
            <div className="marca-nombre">EcoRuta Wanka</div>
            <div className="marca-lema">Reparto sostenible · Huancayo</div>
          </div>
        </div>
        <nav className="nav" aria-label="Módulos">
          {itemsNav(false)}
        </nav>
        <div className="lateral-pie">WankaLogística S.A.C. · Huancayo, Junín</div>
      </aside>

      <header className="barra-movil">
        <div className="marca-logo">
          <Leaf size={18} aria-hidden />
        </div>
        <strong>EcoRuta Wanka</strong>
      </header>

      <main className="contenido">
        <Suspense fallback={<CargandoModulo />}>
          <Modulo
            key={modulo.id}
            ubicacion={ubicacion}
            datos={datos}
            cargando={cargando}
            recargar={recargar}
            notificar={notificar}
            confirmar={confirmar}
          />
        </Suspense>
      </main>

      <nav className="nav-inferior" aria-label="Módulos">
        {itemsNav(true)}
      </nav>

      <Toasts avisos={avisos} onCerrar={cerrarAviso} />
      <DialogoConfirmacion solicitud={solicitud} onResponder={responder} />
    </div>
  )
}
