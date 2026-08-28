import { useCallback, useEffect, useState } from 'react'
import { api } from './services/api.js'
import { AsignacionFormulario } from './components/AsignacionFormulario.jsx'
import { AsignacionLista } from './components/AsignacionLista.jsx'
import { PedidoDetalle } from './components/PedidoDetalle.jsx'
import { PedidoFormulario } from './components/PedidoFormulario.jsx'
import { PedidoLista } from './components/PedidoLista.jsx'
import { RutaFormulario } from './components/RutaFormulario.jsx'
import { RutaDetalle } from './components/RutaDetalle.jsx'
import { ETIQUETAS_ESTADO } from './utils/formatos.js'
import './App.css'

const FILTROS_VACIOS = { estado: '', prioridad: '', busqueda: '' }

function App() {
  const [modulo, setModulo] = useState('pedidos')
  const [pedidos, setPedidos] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [vista, setVista] = useState('lista')
  const [pedidoActivo, setPedidoActivo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [gestionando, setGestionando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [vehiculos, setVehiculos] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [vistaAsignacion, setVistaAsignacion] = useState('lista')
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true)
  const [asignando, setAsignando] = useState(false)

  const [vistaRuta, setVistaRuta] = useState('formulario')
  const [ruta, setRuta] = useState(null)
  const [generando, setGenerando] = useState(false)

  const cargarPedidos = useCallback(
    async (f = filtros) => {
      setCargando(true)
      setError('')
      try {
        const datos = await api.listarPedidos({
          estado: f.estado || undefined,
          prioridad: f.prioridad || undefined,
          busqueda: f.busqueda || undefined,
        })
        setPedidos(datos)
      } catch (e) {
        setError(e.message)
      } finally {
        setCargando(false)
      }
    },
    [filtros],
  )

  useEffect(() => {
    let activo = true
    const inicial = async () => {
      try {
        const datos = await api.listarPedidos()
        if (activo) setPedidos(datos)
      } catch (e) {
        if (activo) setError(e.message)
      } finally {
        if (activo) setCargando(false)
      }
    }
    inicial()
    return () => {
      activo = false
    }
  }, [])

  const cargarDatosAsignaciones = useCallback(async () => {
    setCargandoAsignaciones(true)
    setError('')
    try {
      const [asignacionesDatos, vehiculosDatos] = await Promise.all([
        api.listarAsignaciones(),
        api.listarVehiculos(),
      ])
      setAsignaciones(asignacionesDatos)
      setVehiculos(vehiculosDatos)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargandoAsignaciones(false)
    }
  }, [])

  useEffect(() => {
    let activo = true
    Promise.all([api.listarAsignaciones(), api.listarVehiculos()])
      .then(([asignacionesDatos, vehiculosDatos]) => {
        if (activo) {
          setAsignaciones(asignacionesDatos)
          setVehiculos(vehiculosDatos)
        }
      })
      .catch((e) => {
        if (activo) setError(e.message)
      })
      .finally(() => {
        if (activo) setCargandoAsignaciones(false)
      })
    return () => {
      activo = false
    }
  }, [])

  const cambiarModulo = (m) => {
    setModulo(m)
    setError('')
    setMensaje('')
    if (m === 'asignaciones') {
      setVistaAsignacion('lista')
    } else if (m === 'rutas') {
      setVistaRuta('formulario')
      setRuta(null)
    } else {
      setVista('lista')
      setPedidoActivo(null)
    }
  }

  const abrirCrear = () => {
    setPedidoActivo(null)
    setVista('formulario')
  }

  const abrirEditar = (pedido) => {
    setPedidoActivo(pedido)
    setVista('formulario')
  }

  const abrirDetalle = (pedido) => {
    setPedidoActivo(pedido)
    setVista('detalle')
  }

  const volver = () => {
    setVista('lista')
    setPedidoActivo(null)
  }

  const alGuardar = async (payload) => {
    setGuardando(true)
    setError('')
    try {
      if (pedidoActivo?.id) {
        await api.actualizarPedido(pedidoActivo.id, payload)
        setMensaje('Pedido actualizado correctamente.')
      } else {
        await api.crearPedido(payload)
        setMensaje('Pedido registrado correctamente.')
      }
      setVista('lista')
      setPedidoActivo(null)
      await cargarPedidos()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const alCambiarEstado = async (pedido, estado) => {
    setGestionando(true)
    setError('')
    try {
      await api.cambiarEstado(pedido.id, estado)
      setMensaje(`Estado cambiado a "${ETIQUETAS_ESTADO[estado] || estado}".`)
      await cargarPedidos()
    } catch (e) {
      setError(e.message)
    } finally {
      setGestionando(false)
    }
  }

  const alCancelar = async (pedido) => {
    const confirmar = window.confirm(
      `¿Estás seguro de cancelar el pedido de "${pedido.cliente_nombre}"?`,
    )
    if (!confirmar) return
    setGestionando(true)
    setError('')
    try {
      await api.cancelarPedido(pedido.id)
      setMensaje('Pedido cancelado.')
      await cargarPedidos()
    } catch (e) {
      setError(e.message)
    } finally {
      setGestionando(false)
    }
  }

  const alAsignar = async (payload) => {
    setAsignando(true)
    setError('')
    try {
      await api.crearAsignacion(payload)
      setMensaje('Pedido asignado correctamente.')
      setVistaAsignacion('lista')
      await cargarDatosAsignaciones()
    } catch (e) {
      setError(e.message)
    } finally {
      setAsignando(false)
    }
  }

  const alCancelarAsignacion = async (asignacion) => {
    const confirmar = window.confirm(
      '¿Estás seguro de cancelar esta asignación? El pedido quedará sin vehículo asignado.',
    )
    if (!confirmar) return
    setGestionando(true)
    setError('')
    try {
      await api.cancelarAsignacion(asignacion.id)
      setMensaje('Asignación cancelada.')
      await cargarDatosAsignaciones()
    } catch (e) {
      setError(e.message)
    } finally {
      setGestionando(false)
    }
  }

  const alGenerarRuta = async (payload) => {
    setGenerando(true)
    setError('')
    try {
      const datos = await api.generarRuta(payload)
      setRuta(datos)
      setVistaRuta('resultado')
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerando(false)
    }
  }

  const mapaPedidos = Object.fromEntries(pedidos.map((p) => [p.id, p]))
  const mapaVehiculos = Object.fromEntries(vehiculos.map((v) => [v.id, v]))
  const pedidosDisponibles = pedidos.filter(
    (p) =>
      p.estado !== 'entregado' &&
      p.estado !== 'cancelado' &&
      !asignaciones.some((a) => a.pedido_id === p.id && a.estado === 'asignada'),
  )
  const vehiculosActivos = vehiculos.filter((v) => v.estado === 'activo')
  const vehiculosConRuta = vehiculosActivos.filter((v) =>
    asignaciones.some(
      (a) =>
        a.vehiculo_id === v.id &&
        a.estado === 'asignada' &&
        mapaPedidos[a.pedido_id] &&
        mapaPedidos[a.pedido_id].estado !== 'entregado' &&
        mapaPedidos[a.pedido_id].estado !== 'cancelado',
    ),
  )

  return (
    <div className="contenedor">
      <header className="cabecera">
        <div>
          <h1>EcoRuta Wanka</h1>
          <p className="subtitulo">Optimización sostenible de reparto · Huancayo</p>
        </div>
        <nav className="nav-modulos" aria-label="Módulos del sistema">
          <button
            type="button"
            className={modulo === 'pedidos' ? 'nav-modulo nav-modulo-activo' : 'nav-modulo'}
            onClick={() => cambiarModulo('pedidos')}
          >
            Pedidos
          </button>
          <button
            type="button"
            className={modulo === 'asignaciones' ? 'nav-modulo nav-modulo-activo' : 'nav-modulo'}
            onClick={() => cambiarModulo('asignaciones')}
          >
            Asignaciones
          </button>
          <button
            type="button"
            className={modulo === 'rutas' ? 'nav-modulo nav-modulo-activo' : 'nav-modulo'}
            onClick={() => cambiarModulo('rutas')}
          >
            Rutas
          </button>
        </nav>
      </header>

      <main>
        {error && (
          <div className="aviso aviso-error" role="alert">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="aviso aviso-exito" role="status">
            {mensaje}
          </div>
        )}

        {modulo === 'pedidos' && (
          <>
            {vista === 'lista' && (
              <PedidoLista
                pedidos={pedidos}
                filtros={filtros}
                onCambiarFiltros={(f) => {
                  setFiltros(f)
                  cargarPedidos(f)
                }}
                onCrear={abrirCrear}
                onVer={abrirDetalle}
                onEditar={abrirEditar}
                onCambiarEstado={alCambiarEstado}
                onCancelar={alCancelar}
                cargando={cargando}
              />
            )}

            {vista === 'formulario' && (
              <PedidoFormulario
                modo={pedidoActivo?.id ? 'editar' : 'crear'}
                pedidoInicial={pedidoActivo}
                onGuardar={alGuardar}
                onVolver={volver}
                guardando={guardando}
              />
            )}

            {vista === 'detalle' && pedidoActivo && (
              <PedidoDetalle
                pedido={pedidoActivo}
                onCambiarEstado={alCambiarEstado}
                onCancelar={alCancelar}
                onEditar={abrirEditar}
                onVolver={volver}
                gestionando={gestionando}
              />
            )}
          </>
        )}

        {modulo === 'asignaciones' && (
          <>
            {vistaAsignacion === 'lista' && (
              <AsignacionLista
                asignaciones={asignaciones}
                mapaPedidos={mapaPedidos}
                mapaVehiculos={mapaVehiculos}
                onNueva={() => setVistaAsignacion('nueva')}
                onCancelar={alCancelarAsignacion}
                cargando={cargandoAsignaciones}
                gestionando={gestionando}
              />
            )}

            {vistaAsignacion === 'nueva' && (
              <AsignacionFormulario
                pedidosDisponibles={pedidosDisponibles}
                vehiculosActivos={vehiculosActivos}
                onAsignar={alAsignar}
                onVolver={() => setVistaAsignacion('lista')}
                asignando={asignando}
              />
            )}
          </>
        )}

        {modulo === 'rutas' && (
          <>
            {vistaRuta === 'formulario' && (
              <RutaFormulario
                vehiculos={vehiculosConRuta}
                asignaciones={asignaciones}
                mapaPedidos={mapaPedidos}
                onGenerar={alGenerarRuta}
                onVolver={() => cambiarModulo('asignaciones')}
                generando={generando}
              />
            )}

            {vistaRuta === 'resultado' && ruta && (
              <RutaDetalle
                ruta={ruta}
                onGenerarOtra={() => {
                  setRuta(null)
                  setVistaRuta('formulario')
                }}
                onVolver={() => {
                  setRuta(null)
                  setVistaRuta('formulario')
                }}
              />
            )}
          </>
        )}
      </main>

      <footer className="pie">
        EcoRuta Wanka · Proyecto de optimización logística para Huancayo, Junín, Perú
      </footer>
    </div>
  )
}

export default App