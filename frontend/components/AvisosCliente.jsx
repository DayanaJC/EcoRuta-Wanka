'use client'

// Avisos al cliente del pedido (Sprint 4): conversación tipo WhatsApp con los mensajes que
// el sistema generó solo (recibido, en camino, entregado / no entregado). Cada uno se puede
// enviar por WhatsApp con el enlace de seguimiento; el envío es manual (wa.me), sin API.

import { Check, Copy, ExternalLink, MessageCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { diaLima, enlaceWhatsApp, ETIQUETAS_EVENTO, horaLima, urlSeguimiento } from '../utils/notificaciones.js'

export function AvisosCliente({ pedido }) {
  const [avisos, setAvisos] = useState(null)
  const [error, setError] = useState(null)
  const [copiado, setCopiado] = useState(false)

  // Se vuelve a pedir cuando el pedido cambia de estado (en ruta, entregado…)
  useEffect(() => {
    let vigente = true
    api
      .notificacionesPedido(pedido.id)
      .then((lista) => vigente && (setAvisos(lista), setError(null)))
      .catch((e) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [pedido.id, pedido.estado])

  const enlace = pedido.token_seguimiento ? urlSeguimiento(pedido.token_seguimiento) : null
  const telefono = avisos?.findLast((a) => a.telefono)?.telefono ?? null

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso del portapapeles: el enlace se puede abrir con "Ver seguimiento"
    }
  }

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo">
        <h2>
          <MessageCircle size={17} aria-hidden className="icono-titulo" /> Avisos al cliente
        </h2>
        {enlace && (
          <div className="acciones">
            <button type="button" className="boton boton-secundario boton-sm" onClick={copiar}>
              {copiado ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
              {copiado ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a className="boton boton-secundario boton-sm" href={enlace} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} aria-hidden /> Ver seguimiento
            </a>
          </div>
        )}
      </div>

      <div className="avisos-telefono">
        <div className="avisos-contacto">
          <span className="avisos-avatar" aria-hidden>
            {pedido.cliente_nombre.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <div className="texto-principal">{pedido.cliente_nombre}</div>
            <div className="avisos-numero num">{telefono ? `+51 ${telefono}` : 'Sin teléfono registrado en Clientes'}</div>
          </div>
        </div>

        {error && <p className="avisos-vacio">No se pudieron cargar los avisos: {error}</p>}
        {!error && !avisos && <p className="avisos-vacio">Cargando avisos…</p>}
        {avisos?.length === 0 && <p className="avisos-vacio">Este pedido aún no tiene avisos.</p>}

        {avisos?.length > 0 && (
          <ol className="chat chat-panel">
            {avisos.map((a) => {
              const texto = enlace ? `${a.mensaje}\n\nSigue tu pedido aquí: ${enlace}` : a.mensaje
              return (
                <li key={a.id} className={`chat-burbuja chat-${a.evento}`}>
                  <span className="chat-etiqueta">{ETIQUETAS_EVENTO[a.evento]}</span>
                  <p>{a.mensaje}</p>
                  <div className="chat-pie">
                    <time className="chat-hora num" dateTime={a.fecha}>
                      {diaLima(a.fecha)} · {horaLima(a.fecha)}
                    </time>
                    <a className="chat-enviar" href={enlaceWhatsApp(a.telefono, texto)} target="_blank" rel="noopener noreferrer">
                      <Send size={13} aria-hidden /> Enviar por WhatsApp
                    </a>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
      <p className="avisos-ayuda">
        Los avisos se generan solos al registrar el pedido, al iniciar la ruta y al registrar la entrega.
      </p>
    </section>
  )
}
