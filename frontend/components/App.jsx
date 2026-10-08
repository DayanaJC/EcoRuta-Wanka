'use client'

// Estructura general: barra lateral, datos compartidos, avisos y confirmaciones.
// Cada módulo se encarga de su propia lista, formulario y detalle.

import { ChartColumn, IdCard, Leaf, Package, Route, Truck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { Conductores } from './modulos/Conductores.jsx'
import { Pedidos } from './modulos/Pedidos.jsx'
import { Sostenibilidad } from './modulos/Sostenibilidad.jsx'
import { Rutas } from './modulos/Rutas.jsx'
import { Vehiculos } from './modulos/Vehiculos.jsx'
import { navegar, useUbicacion } from './navegacion.js'
import { DialogoConfirmacion, Toasts } from './ui.jsx'

// Módulos ocultos por ahora (sus archivos siguen en components/modulos/):
// - Resumen: agregarlo como primer elemento y cambiar VISTA_INICIAL en navegacion.js.
// - Asignaciones: { id: 'asignaciones', etiqueta: 'Asignaciones', icono: Link2, componente: Asignaciones }.
const MODULOS = [
  { id: 'pedidos', etiqueta: 'Pedidos', icono: Package, componente: Pedidos },
  { id: 'vehiculos', etiqueta: 'Vehículos', icono: Truck, componente: Vehiculos },
  { id: 'conductores', etiqueta: 'Conductores', icono: IdCard, componente: Conductores },
  { id: 'rutas', etiqueta: 'Rutas', icono: Route, componente: Rutas },
  { id: 'sostenibilidad', etiqueta: 'Sostenibilidad', etiquetaCorta: 'Indicadores', icono: ChartColumn, componente: Sostenibilidad },
]

const CARGADORES = {
  pedidos: () => api.listarPedidos(),
  vehiculos: () => api.listarVehiculos(),
  conductores: () => api.listarConductores(),
  asignaciones: () => api.listarAsignaciones(),
  rutas: () => api.listarRutas(),
}

function useDatos(notificar) {
  const [datos, setDatos] = useState({ pedidos: [], vehiculos: [], conductores: [], asignaciones: [], rutas: [] })
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(
    async (...claves) => {
      const lista = claves.length ? claves : Object.keys(CARGADORES)
      try {
        const resultados = await Promise.all(lista.map((c) => CARGADORES[c]()))
        setDatos((prev) => ({ ...prev, ...Object.fromEntries(lista.map((c, i) => [c, resultados[i]])) }))
      } catch (e) {
        notificar('error', `No se pudo cargar la información: ${e.message}`)
      } finally {
        setCargando(false)
      }
    },
    [notificar],
  )

  // Carga inicial de todas las colecciones
  useEffect(() => {
    let activo = true
    const claves = Object.keys(CARGADORES)
    Promise.all(claves.map((c) => CARGADORES[c]()))
      .then((r) => activo && setDatos(Object.fromEntries(claves.map((c, i) => [c, r[i]]))))
      .catch((e) => activo && notificar('error', `No se pudo conectar con el servidor: ${e.message}`))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [notificar])

  return { datos, cargando, recargar }
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

  const { datos, cargando, recargar } = useDatos(notificar)
  const modulo = MODULOS.find((m) => m.id === ubicacion.vista) ?? MODULOS[0]
  const Modulo = modulo.componente

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
        <Modulo
          key={modulo.id}
          ubicacion={ubicacion}
          datos={datos}
          cargando={cargando}
          recargar={recargar}
          notificar={notificar}
          confirmar={confirmar}
        />
      </main>

      <nav className="nav-inferior" aria-label="Módulos">
        {itemsNav(true)}
      </nav>

      <Toasts avisos={avisos} onCerrar={cerrarAviso} />
      <DialogoConfirmacion solicitud={solicitud} onResponder={responder} />
    </div>
  )
}
