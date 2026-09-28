import { Clock, Link2, Package, Route, Truck } from 'lucide-react'
import { BadgeEstadoRuta } from '../Badges.jsx'
import { navegar } from '../navegacion.js'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'
import { formatearDuracion, formatearFechaCorta, formatearKg, formatearKm, hoyEnLima } from '../../utils/formatos.js'

function Indicador({ icono: Icono, tono, valor, etiqueta, extra, cargando }) {
  return (
    <div className="tarjeta indicador">
      <div className={`indicador-icono tono-${tono}`}>
        <Icono size={20} aria-hidden />
      </div>
      <div>
        <div className="indicador-valor num">{cargando ? <span className="esqueleto" style={{ width: 40, height: 26 }} /> : valor}</div>
        <div className="indicador-etiqueta">{etiqueta}</div>
        {extra && !cargando && <div className="indicador-extra">{extra}</div>}
      </div>
    </div>
  )
}

export function Resumen({ datos, cargando }) {
  const { pedidos, vehiculos, asignaciones, rutas } = datos
  const hoy = hoyEnLima()

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente')
  const express = pendientes.filter((p) => p.prioridad === 'express').length
  const activos = vehiculos.filter((v) => v.estado === 'activo')
  const capacidad = activos.reduce((s, v) => s + v.capacidad_carga_kg, 0)
  const rutasHoy = rutas.filter((r) => r.fecha === hoy && r.estado !== 'cancelada')
  const kmHoy = rutasHoy.reduce((s, r) => s + (r.distancia_estimada_km ?? 0), 0)
  const asignacionesActivas = asignaciones.filter((a) => a.estado === 'asignada').length
  const rutasActivas = rutas.filter((r) => r.estado === 'generada' || r.estado === 'en_reparto').slice(0, 5)
  const placa = (id) => vehiculos.find((v) => v.id === id)?.placa ?? '—'

  return (
    <>
      <EncabezadoPagina
        titulo="Resumen de la operación"
        descripcion={`Estado del reparto de WankaLogística · ${formatearFechaCorta(hoy)}`}
      >
        <button type="button" className="boton boton-primario" onClick={() => navegar({ vista: 'rutas', accion: 'nueva' })}>
          <Route size={17} aria-hidden /> Generar ruta
        </button>
      </EncabezadoPagina>

      <section className="indicadores" aria-label="Indicadores">
        <Indicador
          icono={Package}
          tono="azul"
          valor={pendientes.length}
          etiqueta="Pedidos pendientes"
          extra={express ? `${express} con prioridad express` : 'Sin pedidos express'}
          cargando={cargando}
        />
        <Indicador
          icono={Truck}
          tono="verde"
          valor={`${activos.length}/${vehiculos.length}`}
          etiqueta="Vehículos activos"
          extra={`Capacidad total: ${formatearKg(capacidad)}`}
          cargando={cargando}
        />
        <Indicador
          icono={Route}
          tono="violeta"
          valor={rutasHoy.length}
          etiqueta="Rutas para hoy"
          extra={rutasHoy.length ? `${formatearKm(Number(kmHoy.toFixed(2)))} planificados` : 'Aún no hay rutas para hoy'}
          cargando={cargando}
        />
        <Indicador
          icono={Link2}
          tono="ambar"
          valor={asignacionesActivas}
          etiqueta="Asignaciones activas"
          extra="Pedidos con vehículo asignado"
          cargando={cargando}
        />
      </section>

      <div className="rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Flujo de trabajo</h2>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="pasos-flujo">
              <button type="button" className="paso-flujo" onClick={() => navegar({ vista: 'pedidos', accion: 'nuevo' })}>
                <strong>Registrar pedidos</strong>
                <span>Cliente, ubicación en el mapa, peso y ventana de entrega.</span>
              </button>
              <button type="button" className="paso-flujo" onClick={() => navegar({ vista: 'vehiculos' })}>
                <strong>Revisar la flota</strong>
                <span>Vehículos activos y su capacidad de carga.</span>
              </button>
              <button type="button" className="paso-flujo" onClick={() => navegar({ vista: 'rutas', accion: 'nueva' })}>
                <strong>Generar la ruta</strong>
                <span>Orden óptimo de entrega respetando las ventanas horarias.</span>
              </button>
            </div>
          </div>
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Rutas activas</h2>
            <button type="button" className="boton boton-fantasma boton-sm" onClick={() => navegar({ vista: 'rutas' })}>
              Ver todas
            </button>
          </div>
          {rutasActivas.length === 0 ? (
            <EstadoVacio icono={Route} titulo="Sin rutas activas" descripcion="Las rutas generadas o en reparto aparecerán aquí." />
          ) : (
            <table className="tabla">
              <tbody>
                {rutasActivas.map((r) => (
                  <tr key={r.id} className="fila-clic" onClick={() => navegar({ vista: 'rutas', accion: 'ver', id: r.id })}>
                    <td>
                      <div className="texto-principal">{placa(r.vehiculo_id)}</div>
                      <div className="texto-secundario">
                        {formatearFechaCorta(r.fecha)} · {r.pedido_ids.length} paradas
                      </div>
                    </td>
                    <td className="texto-secundario num">
                      <Clock size={13} aria-hidden /> {r.hora_salida} · {formatearDuracion(r.tiempo_estimado_min)}
                    </td>
                    <td className="col-acciones">
                      <BadgeEstadoRuta estado={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  )
}
