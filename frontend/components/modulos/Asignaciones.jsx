import { Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../services/api.js'
import { AsignacionFormulario } from '../AsignacionFormulario.jsx'
import { AsignacionLista } from '../AsignacionLista.jsx'
import { navegar } from '../navegacion.js'
import { EncabezadoPagina } from '../ui.jsx'

export function Asignaciones({ ubicacion, datos, cargando, recargar, notificar, confirmar }) {
  const [ocupado, setOcupado] = useState(false)
  const pedidosPorId = Object.fromEntries(datos.pedidos.map((p) => [p.id, p]))
  const vehiculosPorId = Object.fromEntries(datos.vehiculos.map((v) => [v.id, v]))
  const activas = datos.asignaciones.filter((a) => a.estado === 'asignada')

  const ejecutar = async (tarea, mensaje) => {
    setOcupado(true)
    try {
      await tarea()
      notificar('exito', mensaje)
      await recargar('asignaciones')
      return true
    } catch (e) {
      notificar('error', e.message)
      return false
    } finally {
      setOcupado(false)
    }
  }

  const asignar = async (payload) => {
    const pedido = pedidosPorId[payload.pedido_id]
    const vehiculo = vehiculosPorId[payload.vehiculo_id]
    const ok = await ejecutar(() => api.crearAsignacion(payload), `${pedido.cliente_nombre} asignado a ${vehiculo.placa}.`)
    if (ok) navegar({ vista: 'asignaciones' }, { reemplazar: true })
  }

  const liberar = async (asignacion, pedido) => {
    const ok = await confirmar({
      titulo: 'Liberar asignación',
      mensaje: `El pedido ${pedido ? `de ${pedido.cliente_nombre} ` : ''}quedará sin vehículo asignado y podrás asignarlo de nuevo.`,
      textoConfirmar: 'Liberar',
      peligro: true,
    })
    if (ok) await ejecutar(() => api.cancelarAsignacion(asignacion.id), 'Asignación liberada.')
  }

  if (ubicacion.accion === 'nueva') {
    const asignados = new Set(activas.map((a) => a.pedido_id))
    const cargaAsignada = {}
    for (const a of activas) cargaAsignada[a.vehiculo_id] = (cargaAsignada[a.vehiculo_id] ?? 0) + (pedidosPorId[a.pedido_id]?.peso_kg ?? 0)
    return (
      <>
        <EncabezadoPagina
          titulo="Nueva asignación"
          descripcion="Asigna un pedido pendiente a un vehículo activo."
          onVolver={() => navegar({ vista: 'asignaciones' })}
          textoVolver="Asignaciones"
        />
        <AsignacionFormulario
          pedidosDisponibles={datos.pedidos.filter((p) => p.estado === 'pendiente' && !asignados.has(p.id))}
          vehiculosActivos={datos.vehiculos.filter((v) => v.estado === 'activo')}
          cargaAsignada={cargaAsignada}
          onAsignar={asignar}
          onCancelar={() => window.history.back()}
          asignando={ocupado}
        />
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Asignaciones" descripcion="Pedidos asignados a cada vehículo de la flota.">
        <button type="button" className="boton boton-primario" onClick={() => navegar({ vista: 'asignaciones', accion: 'nueva' })}>
          <Plus size={17} aria-hidden /> Nueva asignación
        </button>
      </EncabezadoPagina>
      <AsignacionLista
        asignaciones={datos.asignaciones}
        pedidosPorId={pedidosPorId}
        vehiculosPorId={vehiculosPorId}
        cargando={cargando}
        onNueva={() => navegar({ vista: 'asignaciones', accion: 'nueva' })}
        onCancelar={liberar}
        gestionando={ocupado}
      />
    </>
  )
}
