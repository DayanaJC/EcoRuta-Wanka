import { List, Map as IconoMapa, Plus, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { ESTADOS_TERMINALES_PEDIDO, ETIQUETAS_ESTADO_RUTA, formatearFechaCorta, puntualidad } from '../../utils/formatos.js'
import { navegar } from '../navegacion.js'
import { RutaDetalle } from '../RutaDetalle.jsx'
import { RutaFormulario } from '../RutaFormulario.jsx'
import { RutaLista } from '../RutaLista.jsx'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'
import { VistaMapaDia } from '../VistaMapaDia.jsx'

const ir = (accion, id) => navegar({ vista: 'rutas', accion, id })

// Indicador O2: porcentaje de entregas dentro de la ventana horaria del cliente (meta: más del 90 %)
function Puntualidad({ rutas }) {
  const p = puntualidad(rutas)
  if (!p.total && !p.noEntregadas) return null
  const tono = p.pct == null ? 'gris' : p.pct >= 90 ? 'verde' : p.pct >= 75 ? 'ambar' : 'rojo'
  return (
    <section className="tarjeta indicador" style={{ marginBottom: 16 }} aria-label="Entregas a tiempo">
      <div className={`indicador-icono tono-${tono}`}>
        <Timer size={18} aria-hidden />
      </div>
      <div>
        <div className="indicador-valor num">{p.pct != null ? `${p.pct} %` : '—'}</div>
        <div className="indicador-etiqueta">Entregas dentro de la ventana horaria</div>
        <div className="indicador-extra">
          {p.aTiempo} de {p.total} entregas a tiempo · {p.fuera} fuera de horario
          {p.noEntregadas ? ` · ${p.noEntregadas} no entregada(s)` : ''} · meta O2: fuera de horario menos del 10 %
        </div>
      </div>
    </section>
  )
}

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

  // Toda acción sobre la ruta cambia también los pedidos: se recargan ambos
  const ejecutar = async (accion, mensaje) => {
    setOcupado(true)
    try {
      const resultado = await accion()
      notificar('exito', typeof mensaje === 'function' ? mensaje(resultado) : mensaje)
      await recargar('rutas', 'pedidos')
      setVersion((v) => v + 1)
    } catch (e) {
      notificar('error', e.message)
    } finally {
      setOcupado(false)
    }
  }

  const cambiarEstado = (estado) =>
    ejecutar(() => api.actualizarEstadoRuta(ruta.id, estado), `Ruta marcada como "${ETIQUETAS_ESTADO_RUTA[estado]}".`)

  const fin = (r) => (r.estado === 'completada' ? ' La ruta quedó completada.' : '')
  const registrarEntrega = (orden, cuerpo) =>
    ejecutar(
      () => api.registrarEntrega(ruta.id, orden, cuerpo),
      (r) => `Parada ${orden} registrada como ${cuerpo.resultado === 'entregada' ? 'entregada' : 'no entregada'}.${fin(r)}`,
    )

  const simular = (opciones) =>
    ejecutar(() => api.simularRuta(ruta.id, opciones), (r) => {
      const p = puntualidad([r])
      return `Reparto simulado: ${p.aTiempo} de ${p.total} entregas a tiempo${p.noEntregadas ? `, ${p.noEntregadas} no entregada(s)` : ''}.`
    })

  const asignarConductor = (conductorId) =>
    ejecutar(
      () => api.asignarConductor(ruta.id, conductorId),
      conductorId ? `Conductor ${datos.conductores.find((c) => c.id === conductorId)?.nombre ?? ''} asignado a la ruta.` : 'Se quitó el conductor de la ruta.',
    )

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
          conductores={datos.conductores.filter((c) => c.estado === 'activo')}
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
          conductores={datos.conductores}
          rutas={datos.rutas}
          onCambiarEstado={cambiarEstado}
          onAsignarConductor={asignarConductor}
          onCancelar={cancelar}
          onRegistrarEntrega={registrarEntrega}
          onSimular={simular}
          gestionando={ocupado}
        />
      </>
    )
  }

  const conductoresPorId = Object.fromEntries(datos.conductores.map((c) => [c.id, c]))
  const enMapa = accion === 'mapa'
  return (
    <>
      <EncabezadoPagina titulo="Rutas" descripcion="Rutas de reparto optimizadas por vehículo.">
        <div className="segmentos" role="group" aria-label="Forma de ver las rutas">
          <button type="button" className="segmento" aria-pressed={!enMapa} onClick={() => navegar({ vista: 'rutas' }, { reemplazar: true })}>
            <List size={15} aria-hidden /> Lista
          </button>
          <button type="button" className="segmento" aria-pressed={enMapa} onClick={() => navegar({ vista: 'rutas', accion: 'mapa' }, { reemplazar: true })}>
            <IconoMapa size={15} aria-hidden /> Mapa del día
          </button>
        </div>
        <button type="button" className="boton boton-primario" onClick={() => ir('nueva')}>
          <Plus size={17} aria-hidden /> Generar ruta
        </button>
      </EncabezadoPagina>
      {enMapa && cargando ? (
        <div className="mapa-ruta mapa-cargando">Cargando rutas…</div>
      ) : enMapa ? (
        // El día inicial depende de las rutas cargadas
        <VistaMapaDia
          rutas={datos.rutas}
          pedidosPorId={pedidosPorId}
          vehiculosPorId={vehiculosPorId}
          conductoresPorId={conductoresPorId}
          onVer={(r) => ir('ver', r.id)}
          notificar={notificar}
        />
      ) : (
        <>
          <Puntualidad rutas={datos.rutas} />
          <RutaLista rutas={datos.rutas} vehiculosPorId={vehiculosPorId} conductoresPorId={conductoresPorId} cargando={cargando} onVer={(r) => ir('ver', r.id)} onNueva={() => ir('nueva')} />
        </>
      )}
    </>
  )
}
