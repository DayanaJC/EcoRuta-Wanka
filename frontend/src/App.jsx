import { useCallback, useEffect, useState } from 'react'
import { api } from './services/api.js'
import { PedidoDetalle } from './components/PedidoDetalle.jsx'
import { PedidoFormulario } from './components/PedidoFormulario.jsx'
import { PedidoLista } from './components/PedidoLista.jsx'
import { ETIQUETAS_ESTADO } from './utils/formatos.js'
import './App.css'

const FILTROS_VACIOS = { estado: '', prioridad: '', busqueda: '' }

function App() {
  const [pedidos, setPedidos] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [vista, setVista] = useState('lista')
  const [pedidoActivo, setPedidoActivo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [gestionando, setGestionando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

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

  return (
    <div className="contenedor">
      <header className="cabecera">
        <div>
          <h1>EcoRuta Wanka</h1>
          <p className="subtitulo">Optimización sostenible de reparto · Huancayo</p>
        </div>
        <span className="categoria">Gestión de pedidos</span>
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
      </main>

      <footer className="pie">
        EcoRuta Wanka · Proyecto de optimización logística para Huancayo, Junín, Perú
      </footer>
    </div>
  )
}

export default App