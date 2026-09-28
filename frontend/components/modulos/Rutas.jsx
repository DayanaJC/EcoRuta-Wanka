import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { ESTADOS_TERMINALES_PEDIDO, ETIQUETAS_ESTADO_RUTA, formatearFechaCorta } from '../../utils/formatos.js'
import { navegar } from '../navegacion.js'
import { RutaDetalle } from '../RutaDetalle.jsx'
import { RutaFormulario } from '../RutaFormulario.jsx'
import { RutaLista } from '../RutaLista.jsx'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'

const ir = (accion, id) => navegar({ vista: 'rutas', accion, id })

// El listado no incluye el trazado: el detalle completo se pide aparte
function useRutaCompleta(id, version) {
  const [estado, setEstado] = useState({ id: null, ruta: null, error: null })
  useEffect(() => {
    if (!id) return
    let activo = true
    api
      .obtenerRuta(id)
      .then((ruta) => activo && setEstado({ id, ruta, error: null }))
      .catch((error) => activo && setEstado({ id, ruta: null, error }))
    return () => {
      activo = false
    }
  }, [id, version])
  return estado.id === id ? estado : { ruta: null, error: null }
}

export function Rutas({ ubicacion, datos, cargando, recargar, notificar, confirmar }) {
  const [ocupado, setOcupado] = useState(false)
  const [version, setVersion] = useState(0)
  const { accion, id } = ubicacion
  const completa = useRutaCompleta(accion === 'ver' ? id : null, version)
  const resumen = datos.rutas.find((r) => r.id === id)
  const ruta = completa.ruta ?? resumen

  const pedidosPorId = Object.fromEntries(datos.pedidos.map((p) => [p.id, p]))
  const vehiculosPorId = Object.fromEntries(datos.vehiculos.map((v) => [v.id, v]))

  const generar = async (payload) => {
    setOcupado(true)
    try {
      const nueva = await api.generarRuta(payload)
      notificar('exito', `Ruta optimizada: ${nueva.pedido_ids.length} paradas, ${nueva.distancia_estimada_km} km.`)
      await recargar('rutas')
      navegar({ vista: 'rutas', accion: 'ver', id: nueva.id }, { reemplazar: true })
    } catch (e) {
      notificar('error', e.message)
    } finally {
      setOcupado(false)
    }
  }

  const cambiarEstado = async (estado) => {
    setOcupado(true)
    try {
      await api.actualizarEstadoRuta(ruta.id, estado)
      notificar('exito', `Ruta marcada como "${ETIQUETAS_ESTADO_RUTA[estado]}".`)
      await recargar('rutas')
      setVersion((v) => v + 1)
    } catch (e) {
      notificar('error', e.message)
    } finally {
      setOcupado(false)
    }
  }

  const cancelar = async () => {
    const ok = await confirmar({
      titulo: 'Cancelar ruta',
      mensaje: 'La ruta quedará cancelada y sus pedidos podrán incluirse en una ruta nueva.',
      textoConfirmar: 'Cancelar ruta',
      textoCancelar: 'Mantener',
      peligro: true,
    })
    if (ok) await cambiarEstado('cancelada')
  }

  if (accion === 'nueva') {
    // Pedidos que ya están en una ruta activa no se ofrecen de nuevo
    const enRutaActiva = new Set(
      datos.rutas.filter((r) => r.estado === 'generada' || r.estado === 'en_reparto').flatMap((r) => r.pedido_ids),
    )
    const asignacionPorPedido = Object.fromEntries(
      datos.asignaciones.filter((a) => a.estado === 'asignada').map((a) => [a.pedido_id, a.vehiculo_id]),
    )
    return (
      <>
        <EncabezadoPagina
          titulo="Generar ruta optimizada"
          descripcion="El orden de entrega se calcula con la API de OpenRouteService considerando la capacidad del vehículo y las ventanas de entrega."
          onVolver={() => ir()}
          textoVolver="Rutas"
        />
        <RutaFormulario
          vehiculos={datos.vehiculos.filter((v) => v.estado === 'activo')}
          pedidosDisponibles={datos.pedidos.filter((p) => !ESTADOS_TERMINALES_PEDIDO.includes(p.estado) && !enRutaActiva.has(p.id))}
          asignacionPorPedido={asignacionPorPedido}
          onGenerar={generar}
          onCancelar={() => window.history.back()}
          generando={ocupado}
        />
      </>
    )
  }

  if (accion === 'ver') {
    if (!ruta) {
      return (
        <>
          <EncabezadoPagina titulo="Ruta" onVolver={() => ir()} textoVolver="Rutas" />
          <div className="tarjeta">
            {cargando || !completa.error ? (
              <div className="tarjeta-cuerpo">
                <span className="esqueleto" style={{ width: '40%' }} />
              </div>
            ) : (
              <EstadoVacio titulo="Ruta no encontrada" descripcion="Es posible que el enlace sea antiguo." />
            )}
          </div>
        </>
      )
    }
    const vehiculo = vehiculosPorId[ruta.vehiculo_id]
    return (
      <>
        <EncabezadoPagina
          titulo={`Ruta ${vehiculo ? vehiculo.placa : ''} · ${formatearFechaCorta(ruta.fecha)}`}
          descripcion={`Salida ${ruta.hora_salida} desde el almacén`}
          onVolver={() => ir()}
          textoVolver="Rutas"
        />
        <RutaDetalle
          ruta={ruta}
          vehiculo={vehiculo}
          pedidosPorId={pedidosPorId}
          onCambiarEstado={cambiarEstado}
          onCancelar={cancelar}
          gestionando={ocupado}
        />
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Rutas" descripcion="Rutas de reparto optimizadas por vehículo.">
        <button type="button" className="boton boton-primario" onClick={() => ir('nueva')}>
          <Plus size={17} aria-hidden /> Generar ruta
        </button>
      </EncabezadoPagina>
      <RutaLista rutas={datos.rutas} vehiculosPorId={vehiculosPorId} cargando={cargando} onVer={(r) => ir('ver', r.id)} onNueva={() => ir('nueva')} />
    </>
  )
}
