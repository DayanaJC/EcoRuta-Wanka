import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Cargando, CampoGrupo } from './ui.jsx'
import { ETIQUETAS_TIPO_INCIDENTE } from '../utils/formatos.js'

// Incidentes durante el reparto (RF-07): el operador registra lo que pasó y el sistema revisa
// la ruta. Si alguna entrega pendiente quedaría fuera de su ventana, re-optimiza el resto del
// recorrido desde la posición del vehículo; si no, mantiene la planificación.

const VACIO = { tipo: 'trafico_intenso', retraso_min: '0', hora: '', descripcion: '', forzar: false }

function FormularioIncidente({ onRegistrar, onCerrar, gestionando }) {
  const [form, setForm] = useState(VACIO)
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    const ok = await onRegistrar({
      tipo: form.tipo,
      retraso_min: Number(form.retraso_min) || 0,
      descripcion: form.descripcion.trim(),
      forzar: form.forzar,
      ...(form.hora ? { hora: form.hora } : {}),
    })
    if (ok) onCerrar()
  }

  return (
    <form onSubmit={enviar} className="formulario">
      <div className="campos">
        <CampoGrupo etiqueta="¿Qué pasó?" htmlFor="incidente-tipo">
          <select id="incidente-tipo" className="campo" value={form.tipo} onChange={cambiar('tipo')}>
            {Object.entries(ETIQUETAS_TIPO_INCIDENTE).map(([v, e]) => (
              <option key={v} value={v}>
                {e}
              </option>
            ))}
          </select>
        </CampoGrupo>
        <CampoGrupo etiqueta="Tiempo detenido" htmlFor="incidente-retraso" ayuda="Minutos que el vehículo pierde por el incidente.">
          <div className="campo-unidad">
            <input id="incidente-retraso" className="campo" type="number" min="0" max="240" value={form.retraso_min} onChange={cambiar('retraso_min')} />
            <span>min</span>
          </div>
        </CampoGrupo>
        <CampoGrupo etiqueta="Hora del incidente" htmlFor="incidente-hora" ayuda="Vacío = ahora (o la hora del último registro).">
          <input id="incidente-hora" className="campo" type="time" value={form.hora} onChange={cambiar('hora')} />
        </CampoGrupo>
      </div>
      <CampoGrupo etiqueta="Detalle" htmlFor="incidente-detalle" ayuda="Opcional. Ej.: Av. Ferrocarril cerrada por obras.">
        <input id="incidente-detalle" className="campo" value={form.descripcion} onChange={cambiar('descripcion')} maxLength={200} />
      </CampoGrupo>
      <label className="texto-secundario" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={form.forzar} onChange={cambiar('forzar')} /> Re-optimizar aunque ninguna entrega quede fuera de su ventana
      </label>
      <p className="ayuda" style={{ margin: 0 }}>
        El vehículo parte desde la última parada atendida (o el almacén). La velocidad del resto del recorrido se ajusta según el tipo de incidente.
      </p>
      <div className="acciones">
        <button type="submit" className="boton boton-primario boton-sm" disabled={gestionando}>
          {gestionando ? <Cargando texto="Revisando la ruta…" /> : 'Registrar y revisar la ruta'}
        </button>
        <button type="button" className="boton boton-secundario boton-sm" onClick={onCerrar} disabled={gestionando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// Comparación de horarios antes / después de la revisión
function Comparacion({ resumen }) {
  const despuesPorPedido = Object.fromEntries((resumen.despues?.paradas ?? []).map((p, i) => [p.pedido_id, { ...p, orden: i + 1 }]))
  const filas = resumen.despues ? resumen.despues.paradas : resumen.antes.paradas
  const antesPorPedido = Object.fromEntries(resumen.antes.paradas.map((p, i) => [p.pedido_id, { ...p, orden: i + 1 }]))
  const hora = (p) => (p ? <span className={p.fuera_ventana ? 'texto-rojo' : undefined}>{p.hora}{p.fuera_ventana ? ' · fuera de ventana' : ''}</span> : '—')
  return (
    <div className="tabla-envoltorio">
      <table className="tabla">
        <thead>
          <tr>
            <th>Parada</th>
            <th>{resumen.despues ? 'Con el plan anterior' : 'Entrega estimada'}</th>
            {resumen.despues && <th>Nuevo plan</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((p, i) => (
            <tr key={p.pedido_id}>
              <td>
                {i + 1}. {p.cliente}
                {resumen.despues && antesPorPedido[p.pedido_id]?.orden !== i + 1 && (
                  <span className="texto-secundario"> (antes {antesPorPedido[p.pedido_id]?.orden}.ª)</span>
                )}
              </td>
              <td className="num">{hora(antesPorPedido[p.pedido_id])}</td>
              {resumen.despues && <td className="num">{hora(despuesPorPedido[p.pedido_id])}</td>}
            </tr>
          ))}
          <tr>
            <td className="texto-secundario">Regreso al almacén</td>
            <td className="num">{resumen.antes.regreso}</td>
            {resumen.despues && <td className="num">{resumen.despues.regreso}</td>}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function IncidentesRuta({ ruta, onRegistrar, gestionando }) {
  const [abierto, setAbierto] = useState(false)
  const incidentes = [...(ruta.incidentes ?? [])].reverse()
  const enReparto = ruta.estado === 'en_reparto'
  const hayPendientes = (ruta.paradas ?? []).some((p) => p.estado === 'pendiente')
  if (!incidentes.length && !(enReparto && hayPendientes)) return null

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>Incidentes y re-optimización</h2>
        {enReparto && hayPendientes && !abierto && (
          <button type="button" className="boton boton-secundario boton-sm no-imprimir" onClick={() => setAbierto(true)}>
            <TriangleAlert size={15} aria-hidden /> Registrar incidente
          </button>
        )}
      </div>
      <div className="tarjeta-cuerpo pila">
        {abierto && <FormularioIncidente onRegistrar={onRegistrar} onCerrar={() => setAbierto(false)} gestionando={gestionando} />}
        {!incidentes.length && !abierto && (
          <p className="texto-secundario" style={{ margin: 0 }}>
            Si surge un problema en el camino (tráfico, vía cerrada, avería), regístralo: el sistema revisa si las entregas pendientes siguen llegando a tiempo y,
            si no, re-optimiza el resto de la ruta.
          </p>
        )}
        {incidentes.map((i) => (
          <article key={i.id} className={`incidente incidente-${i.resultado}`}>
            <header className="incidente-cabecera">
              <strong>
                {i.hora_referencia} · {ETIQUETAS_TIPO_INCIDENTE[i.tipo] ?? i.tipo}
              </strong>
              <span className={`badge tono-${i.resultado === 'reoptimizada' ? 'ambar' : 'verde'}`}>
                {i.resultado === 'reoptimizada' ? 'Ruta actualizada' : 'Sin cambios'}
              </span>
            </header>
            <div className="texto-secundario">
              {i.retraso_min ? `${i.retraso_min} min detenido` : 'Sin tiempo detenido'}
              {i.factor_velocidad < 1 && ` · velocidad al ${Math.round(i.factor_velocidad * 100)} %`}
              {i.descripcion && ` · ${i.descripcion}`}
            </div>
            <p style={{ margin: '8px 0' }}>{i.resumen?.mensaje}</p>
            {i.resumen?.antes && <Comparacion resumen={i.resumen} />}
          </article>
        ))}
      </div>
    </section>
  )
}
