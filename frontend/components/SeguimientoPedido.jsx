'use client'

// Seguimiento público del pedido (Sprint 4). Lo abre el cliente desde el enlace del aviso
// de WhatsApp: etapa actual, hora estimada, línea de pasos, mapa y los avisos recibidos.
// Se actualiza sola cada 15 s mientras la pestaña está visible.

import { CalendarClock, CircleCheck, CircleX, Clock, MapPin, MessageCircle, PackageCheck, RefreshCw, Truck } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { diaLima, ETIQUETAS_EVENTO, horaLima } from '../utils/notificaciones.js'

const MapaSeguimiento = dynamic(() => import('./MapaSeguimiento.jsx'), {
  ssr: false,
  loading: () => <div className="seg-mapa mapa-cargando">Cargando mapa…</div>,
})

const INTERVALO_MS = 15_000
const PASOS = [
  { clave: 'registrado', titulo: 'Recibido', icono: PackageCheck },
  { clave: 'programado', titulo: 'Programado', icono: CalendarClock },
  { clave: 'en_camino', titulo: 'En camino', icono: Truck },
  { clave: 'entregado', titulo: 'Entregado', icono: CircleCheck },
]
const INDICE_ETAPA = { registrado: 0, programado: 1, en_camino: 2, entregado: 3, no_entregado: 3, cancelado: 0 }

// "2026-11-19" -> "19 nov"
const diaDeFecha = (fecha) => (fecha ? diaLima(`${fecha}T12:00:00-05:00`) : '')

function textoEtapa({ etapa, entrega, pedido }) {
  const hora = entrega?.hora_estimada
  switch (etapa) {
    case 'programado':
      return {
        titulo: 'Tu entrega está programada',
        detalle: `${diaDeFecha(entrega.fecha)}${hora ? ` · llegada estimada ${hora}` : ''}`,
      }
    case 'en_camino': {
      const antes = entrega?.entregas_antes
      return {
        titulo: 'Tu pedido va en camino',
        detalle: hora ? `Llegada estimada ${hora}` : 'Salió del almacén',
        extra: antes === 0 ? 'Eres la siguiente entrega' : antes > 0 ? `${antes} ${antes === 1 ? 'entrega' : 'entregas'} antes de la tuya` : null,
      }
    }
    case 'entregado':
      return { titulo: 'Pedido entregado', detalle: `${diaLima(pedido.fecha_entrega)} a las ${horaLima(pedido.fecha_entrega)}` }
    case 'no_entregado':
      return {
        titulo: 'No pudimos entregar tu pedido',
        detalle: entrega?.motivo_no_entrega ?? 'Intento de entrega sin éxito',
        extra: 'Lo reprogramaremos y te avisaremos la nueva fecha',
      }
    case 'cancelado':
      return { titulo: 'Pedido cancelado', detalle: 'Este pedido ya no se entregará' }
    default:
      return {
        titulo: 'Recibimos tu pedido',
        detalle: `Lo entregaremos entre las ${pedido.ventana_entrega_inicio} y ${pedido.ventana_entrega_fin}`,
        extra: 'Te avisaremos cuando salga a reparto',
      }
  }
}

// Hora que se muestra bajo cada paso ya cumplido
function horaPaso(clave, datos) {
  const aviso = (evento) => datos.avisos.findLast((a) => a.evento === evento)?.fecha
  if (clave === 'registrado') return `${diaLima(datos.pedido.created_at)} ${horaLima(datos.pedido.created_at)}`
  if (clave === 'programado') return datos.entrega ? diaDeFecha(datos.entrega.fecha) : ''
  if (clave === 'en_camino') return horaLima(aviso('en_camino') ?? datos.entrega?.salida_at)
  if (clave === 'entregado') return datos.etapa === 'no_entregado' ? horaLima(aviso('no_entregado')) : horaLima(datos.pedido.fecha_entrega)
  return ''
}

function LineaPasos({ datos }) {
  const actual = INDICE_ETAPA[datos.etapa] ?? 0
  const fallo = datos.etapa === 'no_entregado'
  return (
    <ol className="seg-pasos" aria-label="Progreso del pedido">
      {PASOS.map((paso, i) => {
        const ultimoFallido = fallo && i === 3
        const Icono = ultimoFallido ? CircleX : paso.icono
        const estado = ultimoFallido ? 'fallo' : i < actual || datos.etapa === 'entregado' ? 'hecho' : i === actual ? 'actual' : 'futuro'
        return (
          <li key={paso.clave} className={`seg-paso seg-paso-${estado}`} aria-current={estado === 'actual' ? 'step' : undefined}>
            <span className="seg-paso-icono">
              <Icono size={18} aria-hidden />
            </span>
            <span className="seg-paso-titulo">{ultimoFallido ? 'No entregado' : paso.titulo}</span>
            <span className="seg-paso-hora num">{estado !== 'futuro' ? horaPaso(paso.clave, datos) : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function SeguimientoPedido({ token }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)
  const [actualizado, setActualizado] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const respuesta = await api.seguimiento(token)
      setDatos(respuesta)
      setError(null)
      setActualizado(new Date())
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    // Primera carga y luego cada 15 s, solo con la pestaña visible (Green IT)
    const primera = setTimeout(cargar, 0)
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') cargar()
    }, INTERVALO_MS)
    const alVolver = () => document.visibilityState === 'visible' && cargar()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      clearTimeout(primera)
      clearInterval(id)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [cargar])

  if (!datos) {
    return (
      <main className="seg">
        <header className="seg-cabecera">
          <div className="seg-marca">WankaLogística</div>
        </header>
        <div className="seg-contenido">
          <section className="seg-tarjeta seg-vacio" role={error ? 'alert' : 'status'}>
            {error ? (
              <>
                <CircleX size={28} aria-hidden />
                <h1>No encontramos tu pedido</h1>
                <p>{error} Revisa que el enlace esté completo.</p>
              </>
            ) : (
              <p>Cargando tu pedido…</p>
            )}
          </section>
        </div>
      </main>
    )
  }

  const { pedido, etapa, entrega, almacen, avisos } = datos
  const texto = textoEtapa(datos)

  return (
    <main className="seg">
      <header className="seg-cabecera">
        <div className="seg-marca">WankaLogística</div>
        <div className="seg-cabecera-pedido">
          <span>Pedido</span> <strong className="num">{pedido.codigo}</strong>
        </div>
      </header>

      <div className="seg-contenido">
        <section className={`seg-tarjeta seg-estado seg-estado-${etapa}`} aria-live="polite">
          <div className="seg-estado-fila">
            {etapa === 'en_camino' && <span className="seg-pulso" aria-hidden />}
            <p className="seg-saludo">Hola, {pedido.cliente_nombre}</p>
          </div>
          <h1>{texto.titulo}</h1>
          <p className="seg-detalle">
            <Clock size={16} aria-hidden /> {texto.detalle}
          </p>
          {texto.extra && <p className="seg-extra">{texto.extra}</p>}
          <LineaPasos datos={datos} />
        </section>

        <section className="seg-tarjeta seg-sin-relleno">
          <MapaSeguimiento almacen={almacen} destino={pedido} enCamino={etapa === 'en_camino'} />
          <div className="seg-direccion">
            <MapPin size={18} aria-hidden />
            <div>
              <div className="seg-direccion-texto">{pedido.direccion}</div>
              {pedido.punto_referencia && <div className="seg-suave">{pedido.punto_referencia}</div>}
              <div className="seg-suave num">
                Horario de entrega: {pedido.ventana_entrega_inicio} – {pedido.ventana_entrega_fin}
              </div>
            </div>
          </div>
        </section>

        <section className="seg-tarjeta">
          <h2 className="seg-subtitulo">
            <MessageCircle size={18} aria-hidden /> Avisos que te enviamos
          </h2>
          {avisos.length ? (
            <ol className="chat">
              {avisos.map((a, i) => (
                <li key={`${a.evento}-${i}`} className={`chat-burbuja chat-${a.evento}`}>
                  <span className="chat-etiqueta">{ETIQUETAS_EVENTO[a.evento]}</span>
                  <p>{a.mensaje}</p>
                  <time className="chat-hora num" dateTime={a.fecha}>
                    {diaLima(a.fecha)} · {horaLima(a.fecha)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="seg-suave">Aún no hay avisos.</p>
          )}
        </section>

        <p className="seg-pie">
          <RefreshCw size={13} aria-hidden /> Se actualiza solo · última vez {actualizado ? horaLima(actualizado.toISOString()) : ''}
          {error && <span className="seg-pie-error"> · sin conexión, reintentando</span>}
        </p>
      </div>
    </main>
  )
}
