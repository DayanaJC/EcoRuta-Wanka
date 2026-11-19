'use client'

// Consulta pública del cliente: un solo campo (código del pedido, DNI/RUC o teléfono).
// Si hay un solo pedido abre directo su seguimiento; si hay varios los lista.

import { ChevronRight, CircleCheck, CircleX, Clock, PackageCheck, Search, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '../services/api.js'
import { diaLima, horaLima } from '../utils/notificaciones.js'

const ETAPAS = {
  registrado: { texto: 'Recibido', icono: PackageCheck },
  programado: { texto: 'Programado', icono: Clock },
  en_camino: { texto: 'En camino', icono: Truck },
  entregado: { texto: 'Entregado', icono: CircleCheck },
  no_entregado: { texto: 'No entregado', icono: CircleX },
  cancelado: { texto: 'Cancelado', icono: CircleX },
}

// Primero lo que está por llegar, luego lo ya cerrado
const PRIORIDAD = { en_camino: 0, programado: 1, registrado: 2, no_entregado: 3, entregado: 4, cancelado: 5 }

const diaDeFecha = (fecha) => (fecha ? diaLima(`${fecha}T12:00:00-05:00`) : '')

function detalle(p) {
  if (p.etapa === 'entregado' && p.fecha_entrega) return `Entregado el ${diaLima(p.fecha_entrega)} a las ${horaLima(p.fecha_entrega)}`
  if ((p.etapa === 'programado' || p.etapa === 'en_camino') && p.fecha_programada)
    return `Entrega ${diaDeFecha(p.fecha_programada)}${p.hora_estimada ? ` · llegada estimada ${p.hora_estimada}` : ''}`
  return `Registrado el ${diaLima(p.created_at)}`
}

export function ConsultaPedido() {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState({ cargando: false, error: null, pedidos: null })

  const buscar = async (e) => {
    e.preventDefault()
    const q = texto.trim()
    if (q.length < 3) {
      setEstado({ cargando: false, error: 'Escribe el código de tu pedido, tu DNI o tu teléfono.', pedidos: null })
      return
    }
    setEstado({ cargando: true, error: null, pedidos: null })
    try {
      const pedidos = await api.consultarPedido(q)
      if (pedidos.length === 1) {
        router.push(`/seguimiento/${pedidos[0].token}`)
        return
      }
      setEstado({ cargando: false, error: null, pedidos: pedidos.toSorted((a, b) => PRIORIDAD[a.etapa] - PRIORIDAD[b.etapa]) })
    } catch (err) {
      setEstado({ cargando: false, error: err.message, pedidos: null })
    }
  }

  return (
    <main className="seg">
      <header className="seg-cabecera seg-cabecera-consulta">
        <div className="seg-marca">WankaLogística</div>
        <div className="seg-cabecera-pedido">Seguimiento de pedidos</div>
      </header>

      <div className="seg-contenido">
        <section className="seg-tarjeta consulta">
          <h1>¿Dónde está mi pedido?</h1>
          <p className="seg-suave">Escribe el código de tu pedido, tu DNI o RUC, o tu número de celular.</p>
          <form className="consulta-form" onSubmit={buscar} noValidate>
            <label htmlFor="consulta" className="sr-only">
              Código de pedido, DNI o teléfono
            </label>
            <input
              id="consulta"
              className="campo consulta-campo"
              placeholder="P-3FA85F · 45678912 · 964 123 456"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={60}
              autoComplete="off"
              inputMode="text"
              aria-invalid={Boolean(estado.error)}
              aria-describedby={estado.error ? 'consulta-error' : undefined}
            />
            <button type="submit" className="boton boton-primario consulta-boton" disabled={estado.cargando}>
              <Search size={18} aria-hidden /> {estado.cargando ? 'Buscando…' : 'Buscar'}
            </button>
          </form>
          {estado.error && (
            <p id="consulta-error" className="consulta-error" role="alert">
              {estado.error}
            </p>
          )}
          <p className="consulta-ayuda">El código de tu pedido llega en el mensaje de WhatsApp que te enviamos.</p>
        </section>

        {estado.pedidos && (
          <section className="seg-tarjeta">
            <h2 className="seg-subtitulo">
              {estado.pedidos.length} pedidos de {estado.pedidos[0].cliente_nombre}
            </h2>
            <ul className="consulta-lista">
              {estado.pedidos.map((p) => {
                const etapa = ETAPAS[p.etapa] ?? ETAPAS.registrado
                const Icono = etapa.icono
                return (
                  <li key={p.token}>
                    <Link className="consulta-item" href={`/seguimiento/${p.token}`}>
                      <span className={`consulta-icono consulta-${p.etapa}`}>
                        <Icono size={18} aria-hidden />
                      </span>
                      <span className="consulta-texto">
                        <span className="consulta-codigo num">
                          {p.codigo} <span className={`consulta-pill consulta-${p.etapa}`}>{etapa.texto}</span>
                        </span>
                        <span className="seg-suave">{detalle(p)}</span>
                      </span>
                      <ChevronRight size={18} aria-hidden className="consulta-flecha" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
